import 'dotenv/config';
import { MultiLanguageSearcher } from './src/search/multi-language-searcher';
import { ReportGenerator } from './src/report/report-generator';

async function test() {
  const start = Date.now();
  console.log('Searching for climate change...');
  
  const searcher = new MultiLanguageSearcher(process.env.BRAVE_API_KEY!);
  const results = await searcher.search('climate change', ['en', 'zh']);
  
  console.log('Found', results.length, 'results in', Date.now() - start, 'ms');
  
  if (results.length > 0) {
    const genStart = Date.now();
    const generator = new ReportGenerator();
    const report = generator.generate('climate change', results);
    console.log('Report generated in', Date.now() - genStart, 'ms');
    
    console.log('\n=== 执行摘要 ===');
    console.log(report.executiveSummary);
    console.log('\n=== 各语言观点 ===');
    report.languagePerspectives.forEach(p => {
      console.log(`\n${p.languageName}: ${p.resultCount} 条结果，可信度 ${(p.credibilityScore * 100).toFixed(0)}%`);
      console.log('  关键点:', p.keyPoints.slice(0, 3).join(', '));
    });
  }
}

test().catch(console.error);
