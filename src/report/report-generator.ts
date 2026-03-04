import { SearchResult } from '../search/multi-language-searcher';
import { LANGUAGES } from '../config/languages';

// ─── Report Types ────────────────────────────────────────────────────────────

export interface LanguagePerspective {
  language: string;
  languageName: string;
  resultCount: number;
  topSources: string[];
  keyPoints: string[];
  credibilityScore: number; // 0-1
}

export interface ConsensusPoint {
  theme: string;
  supportingLanguages: string[];
  confidence: number; // 0-1
}

export interface InformationDifference {
  theme: string;
  languageVariations: Array<{
    language: string;
    perspective: string;
  }>;
  divergenceScore: number; // 0-1, higher = more divergent
}

export interface Reference {
  title: string;
  url: string;
  snippet: string;
  language: string;
  languageName: string;
  engine: string;
}

export interface Report {
  query: string;
  generatedAt: Date;
  executiveSummary: string;
  languagePerspectives: LanguagePerspective[];
  consensusPoints: ConsensusPoint[];
  informationDifferences: InformationDifference[];
  overallCredibilityScore: number;
  credibilityBreakdown: Record<string, number>;
  references: Reference[];
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/** Extract the hostname from a URL for display purposes. */
function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Tokenise a snippet into meaningful words (≥4 chars, not stop-words).
 * Returns lower-cased tokens so cross-language ASCII terms (numbers, proper
 * nouns that appear in Latin script) can be compared.
 */
const STOP_WORDS = new Set([
  'that', 'this', 'with', 'from', 'have', 'will', 'been', 'were',
  'they', 'their', 'what', 'when', 'where', 'which', 'there', 'also',
  'more', 'than', 'into', 'some', 'such', 'most', 'only', 'over',
  'very', 'then', 'both', 'about', 'after', 'before', 'while',
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,;:.!?()\[\]"']+/)
    .filter((t) => t.length >= 4 && !STOP_WORDS.has(t) && /[a-z0-9]/.test(t));
}

/** Count term frequencies across an array of texts. */
function termFrequencies(texts: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const text of texts) {
    for (const token of tokenise(text)) {
      freq.set(token, (freq.get(token) ?? 0) + 1);
    }
  }
  return freq;
}

/** Return the top-N entries of a frequency map sorted by count descending. */
function topTerms(freq: Map<string, number>, n: number): string[] {
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([term]) => term);
}

/**
 * Derive human-readable "key points" from a language's search snippets.
 * We group top terms into short thematic phrases by selecting the highest-
 * frequency tokens and presenting them as bullet topics.
 */
function extractKeyPoints(results: SearchResult[], maxPoints = 5): string[] {
  const freq = termFrequencies(results.map((r) => r.snippet));
  const terms = topTerms(freq, maxPoints * 3);
  // Produce one phrase per 3 terms so it reads naturally
  const points: string[] = [];
  for (let i = 0; i < terms.length && points.length < maxPoints; i += 3) {
    const phrase = terms.slice(i, i + 3).join(' / ');
    if (phrase) points.push(phrase);
  }
  return points;
}

/**
 * Credibility score for a single language bucket.
 * Factors: result count (saturation), source diversity, snippet length
 * (longer snippets usually mean richer content).
 */
function languageCredibility(results: SearchResult[]): number {
  if (results.length === 0) return 0;

  const countScore = Math.min(results.length / 10, 1); // saturates at 10 results

  const uniqueDomains = new Set(results.map((r) => hostname(r.url))).size;
  const diversityScore = Math.min(uniqueDomains / results.length, 1);

  const avgSnippetLen =
    results.reduce((s, r) => s + r.snippet.length, 0) / results.length;
  const snippetScore = Math.min(avgSnippetLen / 200, 1); // saturates at 200 chars

  return Math.round(((countScore + diversityScore + snippetScore) / 3) * 100) / 100;
}

/**
 * Detect shared themes across languages.
 * A theme is "shared" when the same top term appears in ≥2 language buckets.
 */
function detectConsensus(
  byLang: Map<string, SearchResult[]>,
  topN = 10,
): ConsensusPoint[] {
  const langTerms = new Map<string, Set<string>>();
  for (const [lang, results] of byLang) {
    const freq = termFrequencies(results.map((r) => `${r.title} ${r.snippet}`));
    langTerms.set(lang, new Set(topTerms(freq, topN)));
  }

  const languages = [...byLang.keys()];
  const termSupport = new Map<string, string[]>(); // term → languages that contain it

  for (const lang of languages) {
    for (const term of langTerms.get(lang) ?? []) {
      if (!termSupport.has(term)) termSupport.set(term, []);
      termSupport.get(term)!.push(lang);
    }
  }

  const consensus: ConsensusPoint[] = [];
  for (const [term, supportLangs] of termSupport) {
    if (supportLangs.length >= 2) {
      consensus.push({
        theme: term,
        supportingLanguages: supportLangs,
        confidence: Math.round((supportLangs.length / languages.length) * 100) / 100,
      });
    }
  }

  return consensus
    .sort((a, b) => b.confidence - a.confidence || b.supportingLanguages.length - a.supportingLanguages.length)
    .slice(0, 8);
}

/**
 * Detect information differences: themes prominent in one language but absent
 * in others.
 */
function detectDifferences(
  byLang: Map<string, SearchResult[]>,
  topN = 8,
): InformationDifference[] {
  const langTopTerms = new Map<string, string[]>();
  for (const [lang, results] of byLang) {
    const freq = termFrequencies(results.map((r) => `${r.title} ${r.snippet}`));
    langTopTerms.set(lang, topTerms(freq, topN));
  }

  const languages = [...byLang.keys()];
  const differences: InformationDifference[] = [];

  // For each term that appears exclusively (or nearly exclusively) in one
  // language, treat it as a potential divergence point.
  const termCount = new Map<string, number>();
  for (const terms of langTopTerms.values()) {
    for (const t of terms) termCount.set(t, (termCount.get(t) ?? 0) + 1);
  }

  const uniqueTermsByLang = new Map<string, string[]>();
  for (const [lang, terms] of langTopTerms) {
    uniqueTermsByLang.set(lang, terms.filter((t) => (termCount.get(t) ?? 0) === 1));
  }

  // Group into difference records by picking the top unique term per language
  // and checking which other languages have the closest counter-term.
  const processedThemes = new Set<string>();
  for (const [lang, uniqueTerms] of uniqueTermsByLang) {
    for (const theme of uniqueTerms.slice(0, 2)) {
      if (processedThemes.has(theme)) continue;
      processedThemes.add(theme);

      const variations: InformationDifference['languageVariations'] = [
        { language: lang, perspective: `Prominent: "${theme}"` },
      ];
      for (const otherLang of languages) {
        if (otherLang === lang) continue;
        const otherTerms = langTopTerms.get(otherLang) ?? [];
        if (!otherTerms.includes(theme)) {
          const alt = otherTerms.find((t) => !processedThemes.has(t)) ?? '(no matching emphasis)';
          variations.push({ language: otherLang, perspective: `Not prominent; top focus: "${alt}"` });
        }
      }

      if (variations.length > 1) {
        differences.push({
          theme,
          languageVariations: variations,
          divergenceScore: Math.round((variations.length / languages.length) * 100) / 100,
        });
      }
      if (differences.length >= 5) break;
    }
    if (differences.length >= 5) break;
  }

  return differences.sort((a, b) => b.divergenceScore - a.divergenceScore);
}

/** Compose the executive summary prose. */
function buildExecutiveSummary(
  query: string,
  byLang: Map<string, SearchResult[]>,
  consensus: ConsensusPoint[],
  differences: InformationDifference[],
  overallScore: number,
): string {
  const langList = [...byLang.keys()]
    .map((l) => LANGUAGES[l]?.name ?? l)
    .join(', ');
  const totalResults = [...byLang.values()].reduce((s, r) => s + r.length, 0);
  const topThemes = consensus
    .slice(0, 3)
    .map((c) => `"${c.theme}"`)
    .join(', ');
  const topDivergences = differences
    .slice(0, 2)
    .map((d) => `"${d.theme}"`)
    .join(', ');

  const scoreLabel =
    overallScore >= 0.75 ? 'high' : overallScore >= 0.5 ? 'moderate' : 'low';

  const lines = [
    `Query: "${query}"`,
    `Analysed ${totalResults} results across ${byLang.size} language(s): ${langList}.`,
  ];
  if (topThemes) lines.push(`Cross-language consensus themes include ${topThemes}.`);
  if (topDivergences)
    lines.push(`Notable information divergences were observed around ${topDivergences}.`);
  lines.push(
    `Overall credibility score: ${(overallScore * 100).toFixed(0)}/100 (${scoreLabel}).`,
  );
  return lines.join(' ');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export class ReportGenerator {
  /**
   * Generate a structured report from multi-language search results.
   *
   * @param query  The original search query.
   * @param results  Flat array of SearchResult objects (mixed languages).
   */
  generate(query: string, results: SearchResult[]): Report {
    // 1. Group by language
    const byLang = new Map<string, SearchResult[]>();
    for (const result of results) {
      if (!byLang.has(result.sourceLanguage)) byLang.set(result.sourceLanguage, []);
      byLang.get(result.sourceLanguage)!.push(result);
    }

    // 2. Build per-language perspectives
    const languagePerspectives: LanguagePerspective[] = [];
    const credibilityBreakdown: Record<string, number> = {};

    for (const [lang, langResults] of byLang) {
      const score = languageCredibility(langResults);
      credibilityBreakdown[lang] = score;

      const uniqueDomains = [...new Set(langResults.map((r) => hostname(r.url)))];

      languagePerspectives.push({
        language: lang,
        languageName: LANGUAGES[lang]?.name ?? lang,
        resultCount: langResults.length,
        topSources: uniqueDomains.slice(0, 5),
        keyPoints: extractKeyPoints(langResults),
        credibilityScore: score,
      });
    }

    // 3. Consensus & differences
    const consensusPoints = detectConsensus(byLang);
    const informationDifferences = detectDifferences(byLang);

    // 4. Overall credibility (weighted average by result count)
    const totalResults = results.length;
    const overallCredibilityScore =
      totalResults === 0
        ? 0
        : Math.round(
            ([...byLang.entries()].reduce((sum, [lang, r]) => {
              return sum + (credibilityBreakdown[lang] ?? 0) * r.length;
            }, 0) /
              totalResults) *
              100,
          ) / 100;

    // 5. Executive summary
    const executiveSummary = buildExecutiveSummary(
      query,
      byLang,
      consensusPoints,
      informationDifferences,
      overallCredibilityScore,
    );

    // 6. References (de-duplicated by URL)
    const seenUrls = new Set<string>();
    const references: Reference[] = [];
    for (const result of results) {
      if (seenUrls.has(result.url)) continue;
      seenUrls.add(result.url);
      references.push({
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        language: result.sourceLanguage,
        languageName: LANGUAGES[result.sourceLanguage]?.name ?? result.sourceLanguage,
        engine: result.sourceEngine,
      });
    }

    return {
      query,
      generatedAt: new Date(),
      executiveSummary,
      languagePerspectives,
      consensusPoints,
      informationDifferences,
      overallCredibilityScore,
      credibilityBreakdown,
      references,
    };
  }

  /**
   * Render a Report as a human-readable Markdown string.
   */
  toMarkdown(report: Report): string {
    const lines: string[] = [];
    const hr = '---';

    lines.push(`# Objective Information Report`);
    lines.push(`**Query:** ${report.query}`);
    lines.push(`**Generated:** ${report.generatedAt.toISOString()}`);
    lines.push('');
    lines.push(hr);

    // Executive summary
    lines.push('## Executive Summary');
    lines.push(report.executiveSummary);
    lines.push('');
    lines.push(hr);

    // Language perspectives
    lines.push('## Perspectives by Language');
    for (const lp of report.languagePerspectives) {
      lines.push(`### ${lp.languageName} (\`${lp.language}\`)`);
      lines.push(`- **Results analysed:** ${lp.resultCount}`);
      lines.push(`- **Credibility score:** ${(lp.credibilityScore * 100).toFixed(0)}/100`);
      lines.push(`- **Top sources:** ${lp.topSources.join(', ') || 'N/A'}`);
      if (lp.keyPoints.length > 0) {
        lines.push('- **Key themes:**');
        for (const kp of lp.keyPoints) lines.push(`  - ${kp}`);
      }
      lines.push('');
    }
    lines.push(hr);

    // Consensus
    lines.push('## Cross-Language Consensus');
    if (report.consensusPoints.length === 0) {
      lines.push('No strong consensus themes detected across languages.');
    } else {
      for (const cp of report.consensusPoints) {
        const langs = cp.supportingLanguages
          .map((l) => LANGUAGES[l]?.name ?? l)
          .join(', ');
        lines.push(
          `- **"${cp.theme}"** — supported by: ${langs} ` +
            `(confidence: ${(cp.confidence * 100).toFixed(0)}%)`,
        );
      }
    }
    lines.push('');
    lines.push(hr);

    // Differences
    lines.push('## Information Divergences');
    if (report.informationDifferences.length === 0) {
      lines.push('No significant divergences detected.');
    } else {
      for (const diff of report.informationDifferences) {
        lines.push(`### Theme: "${diff.theme}" (divergence: ${(diff.divergenceScore * 100).toFixed(0)}%)`);
        for (const v of diff.languageVariations) {
          const langName = LANGUAGES[v.language]?.name ?? v.language;
          lines.push(`- **${langName}:** ${v.perspective}`);
        }
        lines.push('');
      }
    }
    lines.push(hr);

    // Credibility
    lines.push('## Credibility Scores');
    lines.push(`**Overall: ${(report.overallCredibilityScore * 100).toFixed(0)}/100**`);
    lines.push('');
    lines.push('| Language | Score |');
    lines.push('|----------|-------|');
    for (const [lang, score] of Object.entries(report.credibilityBreakdown)) {
      const name = LANGUAGES[lang]?.name ?? lang;
      lines.push(`| ${name} (\`${lang}\`) | ${(score * 100).toFixed(0)}/100 |`);
    }
    lines.push('');
    lines.push(hr);

    // References
    lines.push('## References');
    report.references.forEach((ref, i) => {
      const langName = ref.languageName;
      lines.push(`${i + 1}. **[${ref.title}](${ref.url})** *(${langName}, ${ref.engine})*`);
      if (ref.snippet) lines.push(`   > ${ref.snippet.slice(0, 120)}${ref.snippet.length > 120 ? '…' : ''}`);
    });

    return lines.join('\n');
  }
}
