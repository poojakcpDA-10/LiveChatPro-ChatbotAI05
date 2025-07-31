const fs = require('fs');
const path = require('path');

class CustomAIService {
  constructor() {
    this.languages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'ur': 'Urdu',
      'ta': 'Tamil',
      'te': 'Telugu',
      'mr': 'Marathi',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'pa': 'Punjabi'
    };

    // Load translation dictionaries
    this.translationDict = this.loadTranslationDictionaries();
    
    // Initialize chatbot knowledge base
    this.knowledgeBase = this.initializeKnowledgeBase();
    
    // Common phrases for different languages
    this.commonPhrases = this.loadCommonPhrases();
  }

  // Load basic translation dictionaries
  loadTranslationDictionaries() {
    return {
      'en-es': {
        'hello': 'hola',
        'goodbye': 'adiós',
        'thank you': 'gracias',
        'please': 'por favor',
        'yes': 'sí',
        'no': 'no',
        'good morning': 'buenos días',
        'good evening': 'buenas tardes',
        'how are you': 'cómo estás',
        'what is your name': 'cuál es tu nombre',
        'my name is': 'mi nombre es',
        'nice to meet you': 'mucho gusto',
        'excuse me': 'disculpe',
        'sorry': 'lo siento',
        'help': 'ayuda',
        'water': 'agua',
        'food': 'comida',
        'time': 'tiempo',
        'today': 'hoy',
        'tomorrow': 'mañana',
        'yesterday': 'ayer'
      },
      'en-fr': {
        'hello': 'bonjour',
        'goodbye': 'au revoir',
        'thank you': 'merci',
        'please': 's\'il vous plaît',
        'yes': 'oui',
        'no': 'non',
        'good morning': 'bonjour',
        'good evening': 'bonsoir',
        'how are you': 'comment allez-vous',
        'what is your name': 'quel est votre nom',
        'my name is': 'je m\'appelle',
        'nice to meet you': 'enchanté',
        'excuse me': 'excusez-moi',
        'sorry': 'désolé',
        'help': 'aide',
        'water': 'eau',
        'food': 'nourriture',
        'time': 'temps',
        'today': 'aujourd\'hui',
        'tomorrow': 'demain',
        'yesterday': 'hier'
      },
      'en-hi': {
        'hello': 'नमस्ते',
        'goodbye': 'अलविदा',
        'thank you': 'धन्यवाद',
        'please': 'कृपया',
        'yes': 'हाँ',
        'no': 'नहीं',
        'good morning': 'सुप्रभात',
        'good evening': 'शुभ संध्या',
        'how are you': 'आप कैसे हैं',
        'what is your name': 'आपका नाम क्या है',
        'my name is': 'मेरा नाम है',
        'nice to meet you': 'आपसे मिलकर खुशी हुई',
        'excuse me': 'माफ़ करें',
        'sorry': 'माफ़ी',
        'help': 'मदद',
        'water': 'पानी',
        'food': 'खाना',
        'time': 'समय',
        'today': 'आज',
        'tomorrow': 'कल',
        'yesterday': 'कल'
      }
      
    };
  }

  // Initialize chatbot knowledge base
  initializeKnowledgeBase() {
    return {
      greetings: [
        { patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening'], responses: ['Hello! How can I help you today?', 'Hi there! What can I do for you?', 'Greetings! How may I assist you?'] },
        { patterns: ['namaste', 'नमस्ते'], responses: ['नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ?', 'Namaste! How can I help you?'] }
      ],
      farewells: [
        { patterns: ['bye', 'goodbye', 'see you', 'farewell'], responses: ['Goodbye! Have a great day!', 'See you later!', 'Take care!'] },
        { patterns: ['अलविदा', 'बाय'], responses: ['अलविदा! अच्छा दिन हो!', 'Goodbye! Take care!'] }
      ],
      questions: [
        { patterns: ['how are you', 'what\'s up', 'how do you do'], responses: ['I\'m doing well, thank you for asking!', 'I\'m here and ready to help!', 'All good! How about you?'] },
        { patterns: ['what is your name', 'who are you'], responses: ['I\'m your AI assistant!', 'I\'m here to help you with various tasks.', 'You can call me your friendly AI helper!'] },
        { patterns: ['what can you do', 'help me'], responses: ['I can help with translations, answer questions, have conversations, and assist with various tasks!', 'I\'m here to chat, translate, and help however I can!'] }
      ],
      general: [
        { patterns: ['thank you', 'thanks'], responses: ['You\'re welcome!', 'Happy to help!', 'My pleasure!'] },
        { patterns: ['sorry', 'apologize'], responses: ['No problem at all!', 'It\'s okay!', 'No worries!'] }
      ]
    };
  }

  // Load common phrases for different languages
  loadCommonPhrases() {
    return {
      'en': {
        greetings: ['Hello', 'Hi', 'Good morning', 'Good evening'],
        farewells: ['Goodbye', 'See you later', 'Take care'],
        courtesy: ['Please', 'Thank you', 'You\'re welcome', 'Excuse me', 'Sorry']
      },
      'es': {
        greetings: ['Hola', 'Buenos días', 'Buenas tardes'],
        farewells: ['Adiós', 'Hasta luego', 'Cuídate'],
        courtesy: ['Por favor', 'Gracias', 'De nada', 'Disculpe', 'Lo siento']
      },
      'hi': {
        greetings: ['नमस्ते', 'सुप्रभात', 'शुभ संध्या'],
        farewells: ['अलविदा', 'फिर मिलेंगे'],
        courtesy: ['कृपया', 'धन्यवाद', 'माफ़ करें', 'खुशी हुई']
      }
    };
  }

  // Custom Translation Service
  async translateText(text, sourceLang = 'auto', targetLang = 'en') {
    try {
      // If source and target are the same, return original text
      if (sourceLang === targetLang) {
        return {
          translatedText: text,
          detectedSourceLanguage: sourceLang,
          confidence: 1.0
        };
      }

      // Detect language if auto
      if (sourceLang === 'auto') {
        sourceLang = this.detectLanguage(text);
      }

      // Get translation key
      const translationKey = `${sourceLang}-${targetLang}`;
      const reverseKey = `${targetLang}-${sourceLang}`;

      let translatedText = text;
      let confidence = 0.8;

      // Check if we have a direct translation dictionary
      if (this.translationDict[translationKey]) {
        translatedText = this.translateWithDictionary(text.toLowerCase(), this.translationDict[translationKey]);
        confidence = 0.9;
      } 
      // Check reverse dictionary
      else if (this.translationDict[reverseKey]) {
        const reverseDict = this.createReverseDict(this.translationDict[reverseKey]);
        translatedText = this.translateWithDictionary(text.toLowerCase(), reverseDict);
        confidence = 0.85;
      }
      // Fallback: Rule-based translation for common patterns
      else {
        translatedText = this.ruleBasedTranslation(text, sourceLang, targetLang);
        confidence = 0.7;
      }

      return {
        translatedText: this.capitalizeFirst(translatedText),
        detectedSourceLanguage: sourceLang,
        confidence: confidence
      };

    } catch (error) {
      console.error('Translation error:', error);
      return {
        translatedText: text,
        detectedSourceLanguage: sourceLang,
        confidence: 0.1,
        error: 'Translation failed'
      };
    }
  }

  // Language Detection
  detectLanguage(text) {
    const lowerText = text.toLowerCase();
    
    // Hindi detection (Devanagari script)
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    
    // Arabic detection
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    
    // Chinese detection
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
    
    // Japanese detection
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
    
    // Spanish detection (common words and patterns)
    const spanishWords = ['hola', 'gracias', 'por favor', 'buenos días', 'adiós', 'sí', 'cómo', 'qué', 'está', 'muy'];
    if (spanishWords.some(word => lowerText.includes(word))) return 'es';
    
    // French detection
    const frenchWords = ['bonjour', 'merci', 'au revoir', 'oui', 'non', 'comment', 'est', 'très', 'vous', 'avec'];
    if (frenchWords.some(word => lowerText.includes(word))) return 'fr';
    
    // German detection
    const germanWords = ['hallo', 'danke', 'bitte', 'guten tag', 'auf wiedersehen', 'ja', 'nein', 'wie', 'ist', 'sehr'];
    if (germanWords.some(word => lowerText.includes(word))) return 'de';
    
    // Default to English
    return 'en';
  }

  // Dictionary-based translation
  translateWithDictionary(text, dictionary) {
    let translated = text;
    
    // Sort by length (longer phrases first)
    const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
    
    for (const key of sortedKeys) {
      const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      translated = translated.replace(regex, dictionary[key]);
    }
    
    return translated;
  }

  // Create reverse dictionary
  createReverseDict(dict) {
    const reverse = {};
    for (const [key, value] of Object.entries(dict)) {
      reverse[value] = key;
    }
    return reverse;
  }

  // Rule-based translation fallback
  ruleBasedTranslation(text, sourceLang, targetLang) {
      
    if (sourceLang === 'en' && targetLang === 'es') {
      return text + ' (traducido)';
    } else if (sourceLang === 'en' && targetLang === 'hi') {
      return text + ' (अनुवादित)';
    } else if (sourceLang === 'hi' && targetLang === 'en') {
      return text + ' (translated)';
    }
    
    return text + ` (${targetLang})`;
  }

  // Custom Chatbot Response Generator
  async generateChatResponse(message, options = {}) {
    try {
      const { language = 'en', conversationHistory = [], userPreferences = {} } = options;
      
      const lowerMessage = message.toLowerCase().trim();
      
      // Check greeting patterns
      for (const greeting of this.knowledgeBase.greetings) {
        if (greeting.patterns.some(pattern => lowerMessage.includes(pattern))) {
          return this.getRandomResponse(greeting.responses, language);
        }
      }
      
      // Check farewell patterns
      for (const farewell of this.knowledgeBase.farewells) {
        if (farewell.patterns.some(pattern => lowerMessage.includes(pattern))) {
          return this.getRandomResponse(farewell.responses, language);
        }
      }
      
      // Check question patterns
      for (const question of this.knowledgeBase.questions) {
        if (question.patterns.some(pattern => lowerMessage.includes(pattern))) {
          return this.getRandomResponse(question.responses, language);
        }
      }
      
      // Check general patterns
      for (const general of this.knowledgeBase.general) {
        if (general.patterns.some(pattern => lowerMessage.includes(pattern))) {
          return this.getRandomResponse(general.responses, language);
        }
      }
      
      // Context-aware responses based on conversation history
      if (conversationHistory.length > 0) {
        const contextResponse = this.generateContextualResponse(message, conversationHistory, language);
        if (contextResponse) return contextResponse;
      }
      
      // Topic-based responses
      const topicResponse = this.generateTopicResponse(message, language);
      if (topicResponse) return topicResponse;
      
      // Default fallback responses
      return this.getFallbackResponse(message, language);
      
    } catch (error) {
      console.error('Chat response generation error:', error);
      return {
        text: 'I apologize, but I encountered an error. Please try again.',
        language: language,
        confidence: 0.1
      };
    }
  }

  // Get random response and optionally translate
  getRandomResponse(responses, language) {
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    if (language === 'en') {
      return {
        text: randomResponse,
        language: language,
        confidence: 0.9
      };
    }
    
    // Translate to target language
    return this.translateText(randomResponse, 'en', language).then(result => ({
      text: result.translatedText,
      language: language,
      confidence: 0.8
    }));
  }

  // Generate contextual response based on conversation history
  generateContextualResponse(message, history, language) {
    const lastMessage = history[history.length - 1];
    
    if (lastMessage && lastMessage.from === 'bot') {
      if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('हाँ')) {
        return {
          text: language === 'hi' ? 'बहुत अच्छा! आगे बढ़ते हैं।' : 'Great! Let\'s continue.',
          language: language,
          confidence: 0.8
        };
      }
      
      if (message.toLowerCase().includes('no') || message.toLowerCase().includes('नहीं')) {
        return {
          text: language === 'hi' ? 'कोई बात नहीं। क्या और कुछ है जिसमें मैं मदद कर सकूं?' : 'No problem. Is there anything else I can help with?',
          language: language,
          confidence: 0.8
        };
      }
    }
    
    return null;
  }

  // Generate topic-based responses
  generateTopicResponse(message, language) {
    const lowerMessage = message.toLowerCase();
    
    // Weather-related
    if (lowerMessage.includes('weather') || lowerMessage.includes('मौसम')) {
      return {
        text: language === 'hi' ? 
          'मुझे वर्तमान मौसम की जानकारी नहीं है, लेकिन मैं आपकी अन्य चीजों में मदद कर सकता हूँ!' :
          'I don\'t have access to current weather data, but I can help with other things!',
        language: language,
        confidence: 0.7
      };
    }
    
    // Time-related
    if (lowerMessage.includes('time') || lowerMessage.includes('समय')) {
      const currentTime = new Date().toLocaleTimeString();
      return {
        text: language === 'hi' ? 
          `वर्तमान समय है: ${currentTime}` :
          `The current time is: ${currentTime}`,
        language: language,
        confidence: 0.9
      };
    }
    
    // Math-related
    if (lowerMessage.includes('calculate') || lowerMessage.includes('math') || lowerMessage.includes('गणित')) {
      return {
        text: language === 'hi' ? 
          'मैं बुनियादी गणित में मदद कर सकता हूँ। कृपया अपना सवाल पूछें!' :
          'I can help with basic math! Please ask your question.',
        language: language,
        confidence: 0.8
      };
    }
    
    return null;
  }

  // Fallback response generator
  getFallbackResponse(message, language) {
    const fallbackResponses = {
      'en': [
        'That\'s interesting! Can you tell me more?',
        'I understand. What would you like to know?',
        'I\'m here to help. What can I do for you?',
        'That sounds important. How can I assist?',
        'I see. Is there anything specific you need help with?'
      ],
      'hi': [
        'यह दिलचस्प है! क्या आप और बता सकते हैं?',
        'मैं समझ गया। आप क्या जानना चाहते हैं?',
        'मैं यहाँ मदद के लिए हूँ। मैं आपके लिए क्या कर सकता हूँ?',
        'यह महत्वपूर्ण लगता है। मैं कैसे सहायता कर सकता हूँ?',
        'मैं देख रहा हूँ। क्या कोई खास चीज़ है जिसमें आपको मदद चाहिए?'
      ],
      'es': [
        '¡Eso es interesante! ¿Puedes contarme más?',
        'Entiendo. ¿Qué te gustaría saber?',
        'Estoy aquí para ayudar. ¿Qué puedo hacer por ti?',
        'Eso suena importante. ¿Cómo puedo asistirte?',
        'Ya veo. ¿Hay algo específico con lo que necesites ayuda?'
      ]
    };
    
    const responses = fallbackResponses[language] || fallbackResponses['en'];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      text: randomResponse,
      language: language,
      confidence: 0.6
    };
  }

  // Generate smart reply suggestions
  async generateSmartReplies(lastMessage, language = 'en', count = 3) {
    try {
      const suggestions = [];
      const lowerMessage = lastMessage.toLowerCase();
      
      // Question-based suggestions
      if (lowerMessage.includes('?') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('कैसे') || lowerMessage.includes('क्या')) {
        suggestions.push(
          language === 'hi' ? 'यह एक अच्छा सवाल है' : 'That\'s a good question',
          language === 'hi' ? 'मुझे और जानकारी चाहिए' : 'I need more information',
          language === 'hi' ? 'आप सही कह रहे हैं' : 'You\'re absolutely right'
        );
      }
      // Positive sentiment suggestions
      else if (lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('awesome') || lowerMessage.includes('अच्छा') || lowerMessage.includes('बहुत बढ़िया')) {
        suggestions.push(
          language === 'hi' ? 'बिल्कुल सही!' : 'Absolutely!',
          language === 'hi' ? 'मैं सहमत हूँ' : 'I agree',
          language === 'hi' ? 'और भी बताइए' : 'Tell me more'
        );
      }
      // General suggestions
      else {
        suggestions.push(
          language === 'hi' ? 'दिलचस्प!' : 'Interesting!',
          language === 'hi' ? 'समझ गया' : 'I understand',
          language === 'hi' ? 'और क्या?' : 'What else?'
        );
      }
      
      return suggestions.slice(0, count);
      
    } catch (error) {
      console.error('Smart replies generation error:', error);
      return [
        language === 'hi' ? 'हाँ' : 'Yes',
        language === 'hi' ? 'दिलचस्प' : 'Interesting',
        language === 'hi' ? 'और बताइए' : 'Tell me more'
      ];
    }
  }

  // Text-to-Speech (Browser-based implementation)
  async textToSpeech(text, language = 'en', options = {}) {
    // This returns instructions for client-side implementation
    return {
      text: text,
      language: this.mapLanguageForSpeech(language),
      voice: options.voice || 'default',
      rate: options.rate || 1.0,
      pitch: options.pitch || 1.0,
      volume: options.volume || 1.0,
      implementation: 'browser_speech_synthesis',
      instructions: 'Use browser SpeechSynthesis API on client side'
    };
  }

  // Speech-to-Text placeholder (would need client-side implementation)
  async speechToText(audioData, language = 'en') {
    
    return {
      text: 'Audio transcription not available in backend. Use browser Web Speech API.',
      language: language,
      confidence: 0.0,
      implementation: 'browser_speech_recognition',
      instructions: 'Use browser SpeechRecognition API on client side'
    };
  }

  // Map language codes for speech
  mapLanguageForSpeech(language) {
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
      'hi': 'hi-IN'
    };
    return mapping[language] || 'en-US';
  }

  // Utility function to capitalize first letter
  capitalizeFirst(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Health check
  async healthCheck() {
    return {
      status: 'healthy',
      services: {
        translation: 'available',
        chatbot: 'available',
        textToSpeech: 'browser-based',
        speechToText: 'browser-based'
      },
      languages: Object.keys(this.languages),
      timestamp: new Date()
    };
  }
}

module.exports = new CustomAIService();