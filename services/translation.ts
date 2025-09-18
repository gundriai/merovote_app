import { I18nManager } from 'react-native';
import neTranslation from '../locales/ne/translation.json';
import enTranslation from '../locales/en/translation.json';

export type Language = 'ne' | 'en';

class TranslationService {
  private currentLanguage: Language = 'ne'; // Default to Nepali
  private translations: Record<Language, any> = {
    ne: neTranslation,
    en: enTranslation,
  };

  constructor() {
    // Set RTL for Nepali if needed
    I18nManager.allowRTL(false);
  }

  setLanguage(language: Language) {
    this.currentLanguage = language;
    // You can add logic to persist language preference here
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let translation: any = this.translations[this.currentLanguage];

    // Navigate through nested keys
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to English if key not found in current language
        translation = this.translations.en;
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            return key; // Return key if not found anywhere
          }
        }
        break;
      }
    }

    if (typeof translation !== 'string') {
      return key;
    }

    // Replace parameters in translation
    if (params) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return translation;
  }

  // Helper method to get nested translations
  getNestedTranslation(keys: string[]): any {
    let translation: any = this.translations[this.currentLanguage];
    
    for (const key of keys) {
      if (translation && typeof translation === 'object' && key in translation) {
        translation = translation[key];
      } else {
        // Fallback to English
        translation = this.translations.en;
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            return null;
          }
        }
        break;
      }
    }
    
    return translation;
  }
}

export const translationService = new TranslationService();
export default translationService;
