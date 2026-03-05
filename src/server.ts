import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { MultiLanguageSearcher } from './search/multi-language-searcher';
import { ReportGenerator } from './report/report-generator';

const app = express();
const PORT = process.env.PORT ?? 3000;

const apiKey = process.env.BRAVE_API_KEY;
if (!apiKey) {
  console.error('Error: BRAVE_API_KEY environment variable is not set.');
  process.exit(1);
}

const searcher = new MultiLanguageSearcher(apiKey);
const reportGenerator = new ReportGenerator();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

interface SearchRequestBody {
  query: string;
  languages: string[];
}

app.post('/api/search', async (req: Request<object, object, SearchRequestBody>, res: Response) => {
  const { query, languages } = req.body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    res.status(400).json({ error: 'query is required' });
    return;
  }

  if (!Array.isArray(languages) || languages.length === 0) {
    res.status(400).json({ error: 'languages must be a non-empty array' });
    return;
  }

  try {
    const results = await searcher.search(query.trim(), languages);
    const report = reportGenerator.generate(query.trim(), results);

    res.json({ results, report });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', details: err instanceof Error ? err.message : String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
