class SpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.recognition = null;
    this.isSupported = {
      tts: 'speechSynthesis' in window,
      stt: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    };
    
    this.initializeSpeechRecognition();
    this.voices = [];
    this.loadVoices();
  }

  // Initialize Speech Recognition
  initializeSpeechRecognition() {
    if (this.isSupported.stt) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  // Load available voices
  loadVoices() {
    const updateVoices = () => {
      this.voices = this.synthesis.getVoices();
    };

    updateVoices();
    
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = updateVoices;
    }
  }

  // Get best voice for language
  getBestVoice(language = 'en-US', preferredGender = 'female') {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    // First, try to find exact language match
    let voice = this.voices.find(v => 
      v.lang === language && 
      (preferredGender === 'female' ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') : 
       v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man'))
    );

    // If no gender preference match, try any voice with exact language
    if (!voice) {
      voice = this.voices.find(v => v.lang === language);
    }

    // Try language prefix match (e.g., 'en' for 'en-US')
    if (!voice) {
      const langPrefix = language.split('-')[0];
      voice = this.voices.find(v => v.lang.startsWith(langPrefix));
    }

    // Default to first available voice
    return voice || this.voices[0] || null;
  }

  // Text-to-Speech
  async speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported.tts) {
        reject(new Error('Text-to-speech not supported in this browser'));
        return;
      }

      if (!text || text.trim().length === 0) {
        reject(new Error('No text provided'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      const {
        language = 'en-US',
        rate = 1.0,
        pitch = 1.0,
        volume = 1.0,
        voice = null
      } = options;

      utterance.lang = language;
      utterance.rate = Math.max(0.1, Math.min(10, rate));
      utterance.pitch = Math.max(0, Math.min(2, pitch));
      utterance.volume = Math.max(0, Math.min(1, volume));

      // Set voice
      if (voice) {
        utterance.voice = voice;
      } else {
        const bestVoice = this.getBestVoice(language);
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
      }

      // Event handlers
      utterance.onstart = () => {
        console.log('Speech started');
      };

      utterance.onend = () => {
        console.log('Speech ended');
        resolve({
          success: true,
          message: 'Speech completed',
          duration: text.length * 100 // Rough estimate in ms
        });
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      // Start speaking
      this.synthesis.speak(utterance);
    });
  }

  // Stop current speech
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Check if currently speaking
  isSpeaking() {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  // Speech-to-Text
  async listen(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported.stt) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }

      if (!this.recognition) {
        reject(new Error('Speech recognition not initialized'));
        return;
      }

      const {
        language = 'en-US',
        continuous = false,
        interimResults = false,
        maxAlternatives = 1,
        timeout = 10000
      } = options;

      // Configure recognition
      this.recognition.lang = language;
      this.recognition.continuous = continuous;
      this.recognition.interimResults = interimResults;
      this.recognition.maxAlternatives = maxAlternatives;

      let timeoutId;
      let isResolved = false;

      // Set timeout
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          if (!isResolved) {
            this.recognition.stop();
            reject(new Error('Speech recognition timeout'));
          }
        }, timeout);
      }

      // Event handlers
      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      this.recognition.onresult = (event) => {
        if (isResolved) return;

        const results = [];
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal || interimResults) {
            results.push({
              transcript: result[0].transcript,
              confidence: result[0].confidence,
              isFinal: result.isFinal
            });
          }
        }

        if (results.length > 0 && (results[0].isFinal || !continuous)) {
          isResolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          
          resolve({
            success: true,
            results: results,
            transcript: results[0].transcript,
            confidence: results[0].confidence
          });
        }
      };

      this.recognition.onerror = (event) => {
        if (isResolved) return;
        
        isResolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        
        console.error('Speech recognition error:', event.error);
        reject(new Error(`Speech recognition failed: ${event.error}`));
      };

      this.recognition.onend = () => {
        if (!isResolved) {
          isResolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          resolve({
            success: false,
            message: 'No speech detected',
            transcript: '',
            confidence: 0
          });
        }
      };

      // Start recognition
      try {
        this.recognition.start();
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error(`Failed to start speech recognition: ${error.message}`));
      }
    });
  }

  // Stop listening
  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // Get available voices for a language
  getVoicesForLanguage(language) {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    return this.voices.filter(voice => 
      voice.lang === language || voice.lang.startsWith(language.split('-')[0])
    );
  }

  // Get supported languages
  getSupportedLanguages() {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const languages = [...new Set(this.voices.map(voice => voice.lang))];
    return languages.sort();
  }

  // Check if browser supports speech features
  checkSupport() {
    return {
      textToSpeech: this.isSupported.tts,
      speechToText: this.isSupported.stt,
      voicesAvailable: this.voices.length > 0,
      totalVoices: this.voices.length
    };
  }

  // Convert language code to speech-friendly format
  normalizeLangCode(langCode) {
    const mapping = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'bn': 'bn-BD',
      'ur': 'ur-PK',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN'
    };

    return mapping[langCode] || langCode;
  }

  // Demo function to test speech features
  async demo(language = 'en') {
    const normalizedLang = this.normalizeLangCode(language);
    
    const demoTexts = {
      'en-US': 'Hello! This is a speech synthesis demonstration.',
      'es-ES': 'Hola! Esta es una demostración de síntesis de voz.',
      'fr-FR': 'Bonjour! Ceci est une démonstration de synthèse vocale.',
      'de-DE': 'Hallo! Dies ist eine Sprachsynthese-Demonstration.',
      'hi-IN': 'नमस्ते! यह एक वाक् संश्लेषण प्रदर्शन है।',
      'zh-CN': '你好！这是语音合成演示。',
      'ja-JP': 'こんにちは！これは音声合成のデモンストレーションです。',
      'ar-SA': 'مرحبا! هذا عرض توضيحي لتركيب الكلام.'
    };

    const text = demoTexts[normalizedLang] || demoTexts['en-US'];
    
    try {
      await this.speak(text, { language: normalizedLang });
      console.log('Demo speech completed');
    } catch (error) {
      console.error('Demo failed:', error);
    }
  }
}

// Create singleton instance
const speechService = new SpeechService();

export default speechService;