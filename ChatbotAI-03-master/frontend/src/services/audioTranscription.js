class AudioTranscriptionService {
  constructor() {
    this.recognition = null;
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    this.initializeSpeechRecognition();
  }

  initializeSpeechRecognition() {
    if (this.isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  async transcribeAudioFile(audioBlob, language = 'en-US') {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      // Create audio element and play it for transcription
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      this.recognition.lang = language;
      
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        resolve({
          transcript,
          confidence,
          success: true
        });
      };

      this.recognition.onerror = (event) => {
        reject(new Error(`Transcription failed: ${event.error}`));
      };

      this.recognition.onend = () => {
        console.log('Transcription completed');
      };

      // Start transcription
      this.recognition.start();
    });
  }

  async transcribeAudioUrl(audioUrl, language = 'en-US') {
    try {
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();
      return await this.transcribeAudioFile(audioBlob, language);
    } catch (error) {
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  isSupported() {
    return this.isSupported;
  }
}

export default new AudioTranscriptionService();