import axios from 'axios';

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  sourceLanguage: string;
  sourceEngine: string;
}

interface BraveSearchResponse {
  web?: {
    results?: Array<{
      title: string;
      description: string;
      url: string;
    }>;
  };
}

// Brave Search API language/market codes per language (仅支持 Brave API 支持的语言)
const BRAVE_LANG_PARAMS: Record<string, { country: string; search_lang: string; ui_lang: string }> = {
  en: { country: 'US', search_lang: 'en', ui_lang: 'en-US' },
  zh: { country: 'CN', search_lang: 'zh-hans', ui_lang: 'zh-CN' },
  fr: { country: 'FR', search_lang: 'fr', ui_lang: 'fr-FR' },
  de: { country: 'DE', search_lang: 'de', ui_lang: 'de-DE' },
  ru: { country: 'RU', search_lang: 'ru', ui_lang: 'ru-RU' },
  es: { country: 'ES', search_lang: 'es', ui_lang: 'es-ES' },
  pt: { country: 'BR', search_lang: 'pt', ui_lang: 'pt-BR' },
};

export class MultiLanguageSearcher {
  private apiKey: string;
  private baseUrl = 'https://api.search.brave.com/res/v1/web/search';
  private resultsPerLanguage: number;

  constructor(apiKey: string, resultsPerLanguage = 5) {
    this.apiKey = apiKey;
    this.resultsPerLanguage = resultsPerLanguage;
  }

  async search(query: string, languages: string[]): Promise<SearchResult[]> {
    const searches = languages.map((lang) => this.searchInLanguage(query, lang));
    const results = await Promise.allSettled(searches);

    return results.flatMap((result, i) => {
      if (result.status === 'fulfilled') return result.value;
      console.error(`Search failed for language "${languages[i]}":`, result.reason);
      return [];
    });
  }

  private async searchInLanguage(query: string, language: string): Promise<SearchResult[]> {
    const params = BRAVE_LANG_PARAMS[language];
    if (!params) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const response = await axios.get<BraveSearchResponse>(this.baseUrl, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': this.apiKey,
      },
      params: {
        q: query,
        count: this.resultsPerLanguage,
        country: params.country,
        search_lang: params.search_lang,
        ui_lang: params.ui_lang,
      },
    });

    const webResults = response.data.web?.results ?? [];

    return webResults.map((item) => ({
      title: item.title,
      snippet: item.description,
      url: item.url,
      sourceLanguage: language,
      sourceEngine: 'brave',
    }));
  }
}
