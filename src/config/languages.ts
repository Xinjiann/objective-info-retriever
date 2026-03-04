/**
 * 支持的语言配置
 */

export interface SearchEngineConfig {
  name: string;
  baseUrl: string;
  queryParam: string;
  additionalParams?: Record<string, string>;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  searchEngines: SearchEngineConfig[];
  defaultSearchEngine: string;
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    defaultSearchEngine: 'google',
    searchEngines: [
      {
        name: 'google',
        baseUrl: 'https://www.google.com/search',
        queryParam: 'q',
        additionalParams: { hl: 'en', gl: 'us' },
      },
      {
        name: 'bing',
        baseUrl: 'https://www.bing.com/search',
        queryParam: 'q',
        additionalParams: { setlang: 'en-US', cc: 'US' },
      },
      {
        name: 'duckduckgo',
        baseUrl: 'https://duckduckgo.com/',
        queryParam: 'q',
        additionalParams: { kl: 'us-en' },
      },
    ],
  },

  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    defaultSearchEngine: 'baidu',
    searchEngines: [
      {
        name: 'baidu',
        baseUrl: 'https://www.baidu.com/s',
        queryParam: 'wd',
        additionalParams: { ie: 'utf-8' },
      },
      {
        name: 'google',
        baseUrl: 'https://www.google.com/search',
        queryParam: 'q',
        additionalParams: { hl: 'zh-CN', gl: 'cn' },
      },
      {
        name: 'bing',
        baseUrl: 'https://www.bing.com/search',
        queryParam: 'q',
        additionalParams: { setlang: 'zh-CN', cc: 'CN' },
      },
    ],
  },

  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    defaultSearchEngine: 'google',
    searchEngines: [
      {
        name: 'google',
        baseUrl: 'https://www.google.co.jp/search',
        queryParam: 'q',
        additionalParams: { hl: 'ja', gl: 'jp' },
      },
      {
        name: 'bing',
        baseUrl: 'https://www.bing.com/search',
        queryParam: 'q',
        additionalParams: { setlang: 'ja-JP', cc: 'JP' },
      },
      {
        name: 'yahoo_japan',
        baseUrl: 'https://search.yahoo.co.jp/search',
        queryParam: 'p',
        additionalParams: { ei: 'UTF-8' },
      },
    ],
  },

  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    defaultSearchEngine: 'google',
    searchEngines: [
      {
        name: 'google',
        baseUrl: 'https://www.google.fr/search',
        queryParam: 'q',
        additionalParams: { hl: 'fr', gl: 'fr' },
      },
      {
        name: 'bing',
        baseUrl: 'https://www.bing.com/search',
        queryParam: 'q',
        additionalParams: { setlang: 'fr-FR', cc: 'FR' },
      },
      {
        name: 'qwant',
        baseUrl: 'https://www.qwant.com/',
        queryParam: 'q',
        additionalParams: { l: 'fr' },
      },
    ],
  },

  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    defaultSearchEngine: 'google',
    searchEngines: [
      {
        name: 'google',
        baseUrl: 'https://www.google.de/search',
        queryParam: 'q',
        additionalParams: { hl: 'de', gl: 'de' },
      },
      {
        name: 'bing',
        baseUrl: 'https://www.bing.com/search',
        queryParam: 'q',
        additionalParams: { setlang: 'de-DE', cc: 'DE' },
      },
      {
        name: 'ecosia',
        baseUrl: 'https://www.ecosia.org/search',
        queryParam: 'q',
        additionalParams: { lang: 'de' },
      },
    ],
  },

  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    defaultSearchEngine: 'yandex',
    searchEngines: [
      {
        name: 'yandex',
        baseUrl: 'https://yandex.ru/search/',
        queryParam: 'text',
        additionalParams: { lr: '213' },
      },
      {
        name: 'google',
        baseUrl: 'https://www.google.ru/search',
        queryParam: 'q',
        additionalParams: { hl: 'ru', gl: 'ru' },
      },
      {
        name: 'bing',
        baseUrl: 'https://www.bing.com/search',
        queryParam: 'q',
        additionalParams: { setlang: 'ru-RU', cc: 'RU' },
      },
    ],
  },

  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    defaultSearchEngine: 'google',
    searchEngines: [
      {
        name: 'google',
        baseUrl: 'https://www.google.com/search',
        queryParam: 'q',
        additionalParams: { hl: 'ar', gl: 'sa' },
      },
      {
        name: 'bing',
        baseUrl: 'https://www.bing.com/search',
        queryParam: 'q',
        additionalParams: { setlang: 'ar-SA', cc: 'SA' },
      },
      {
        name: 'yandex',
        baseUrl: 'https://yandex.com/search/',
        queryParam: 'text',
        additionalParams: { lr: '11508' },
      },
    ],
  },
};

export const SUPPORTED_LANGUAGE_CODES = Object.keys(LANGUAGES) as Array<keyof typeof LANGUAGES>;

export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return LANGUAGES[code];
}

export function getSearchEngine(
  languageCode: string,
  engineName?: string
): SearchEngineConfig | undefined {
  const lang = getLanguageConfig(languageCode);
  if (!lang) return undefined;

  const name = engineName ?? lang.defaultSearchEngine;
  return lang.searchEngines.find((e) => e.name === name);
}
