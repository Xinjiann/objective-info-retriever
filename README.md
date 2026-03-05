# Objective Info Retriever

**Break the language barrier. See the world as it is.**

---

## The Problem: You Only Know What Your Language Tells You

We live in an age of information abundance — and yet, most of us are profoundly uninformed.

Not because the truth is hidden. But because the truth is written in languages we don't read.

Every day, billions of people consume news, form opinions, and make judgments about the world based on a single linguistic slice of reality. The English-speaking world reads Reuters and the BBC. The Arabic-speaking world reads Al Jazeera and local commentators. The Chinese-speaking world reads Weibo and WeChat. Each ecosystem produces coherent, internally consistent narratives — and each is radically incomplete.

This is not propaganda. This is not censorship (though that exists too). This is something more subtle and more pervasive: **the cognitive cage of language itself.**

### A Concrete Example: The TikTok / Douyin Divide

In 2024, discussions about TikTok's relationship with Iran became a flashpoint in Western media. English-language sources framed the story around algorithmic amplification of Iranian state narratives, national security concerns, and geopolitical influence operations.

Meanwhile, Arabic-language sources — drawing on lived experience across the Middle East — told a different story: one of platform inconsistency, content moderation double standards, and the silencing of Palestinian and Iranian voices depending on the political moment.

Both perspectives contain real observations. Neither perspective, alone, contains the full picture.

An English reader and an Arabic reader searched the same topic and arrived at nearly opposite conclusions — not because one was lying, but because **each was telling the truth from within their own information horizon.**

### Another Example: The EU Comment Section Problem

When EU spokespersons address foreign policy on social media, the comment sections fracture along linguistic lines. English-language commenters debate procedural legitimacy and international law. Russian-language commenters invoke historical grievances and NATO expansion narratives. German-language commenters split between Atlanticist solidarity and economic pragmatism.

The EU spokesperson is not speaking to multiple audiences — they are speaking once, into a void that splinters into a dozen incompatible realities the moment it hits different linguistic communities.

**Misunderstanding is not the exception. It is the default state of cross-cultural communication.**

---

## The Solution: Cross-Language Intelligence

**Objective Info Retriever** is a tool that searches the same question across multiple languages simultaneously — then uses AI to surface what different linguistic communities are saying, where they agree, and where they diverge.

It does not tell you what to think. It shows you the full landscape of what is being thought.

### What It Does

1. **Multi-language search**: Submit a single query and retrieve results from English, Chinese, French, German, Russian, Arabic, Spanish, and Portuguese sources simultaneously — each through the appropriate regional search context.

2. **Cross-language analysis**: Automatically identifies themes that appear across language communities (consensus) and themes that appear in only one linguistic sphere (divergence).

3. **Structured reports**: Generates a structured intelligence report with per-language perspectives, credibility scores, source diversity metrics, and a ranked reference list.

4. **Web UI**: A clean browser interface for interactive use — enter a query, select languages, read the report.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Web UI (public/)                │
│         Browser-based query interface            │
└────────────────────┬────────────────────────────┘
                     │ POST /api/search
┌────────────────────▼────────────────────────────┐
│              Express Server (server.ts)          │
└──────────┬──────────────────────┬───────────────┘
           │                      │
┌──────────▼──────────┐  ┌────────▼──────────────┐
│  MultiLanguageSearch │  │   ReportGenerator     │
│  er (Brave API)      │  │                       │
│                      │  │  - Per-language stats  │
│  Parallel queries    │  │  - Consensus detection │
│  across 7 languages  │  │  - Divergence analysis │
│  via Brave Search    │  │  - Credibility scoring │
└──────────────────────┘  └───────────────────────┘
```

**Key components:**

| File | Role |
|------|------|
| `src/server.ts` | Express HTTP server, `/api/search` endpoint |
| `src/search/multi-language-searcher.ts` | Parallel Brave Search API queries per language |
| `src/report/report-generator.ts` | Analysis engine: consensus, divergence, credibility |
| `src/config/languages.ts` | Language and search engine configuration |

**Supported languages:** English, Chinese (Simplified), French, German, Russian, Spanish, Portuguese

**Search backend:** [Brave Search API](https://brave.com/search/api/) — chosen for its independence from Google/Bing ecosystems and support for language/country-scoped queries.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Brave Search API](https://brave.com/search/api/) key (free tier available)

### Installation

```bash
git clone https://github.com/your-username/objective-info-retriever.git
cd objective-info-retriever
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env and set your Brave API key:
# BRAVE_API_KEY=your_api_key_here
```

### Run

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

Open `http://localhost:3000` in your browser.

### API Usage

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "TikTok Iran content moderation",
    "languages": ["en", "ar", "fr", "de"]
  }'
```

**Response structure:**

```json
{
  "results": [...],
  "report": {
    "executiveSummary": "...",
    "languagePerspectives": [...],
    "consensusPoints": [...],
    "informationDifferences": [...],
    "overallCredibilityScore": 0.74,
    "references": [...]
  }
}
```

---

## What a Report Looks Like

For a query like *"EU sanctions Russia energy"* across English, German, French, and Russian:

- **Consensus themes** (appear in 3+ languages): `sanctions`, `energy`, `export`
- **Divergences**:
  - English sources emphasize: `"compliance"` — enforcement mechanisms and corporate liability
  - Russian sources emphasize: `"bypass"` — alternative trade routes and non-Western partners
  - German sources emphasize: `"dependency"` — domestic energy security and industrial impact
  - French sources emphasize: `"diplomacy"` — negotiated offramps and EU internal divisions

Same event. Four completely different stories. All of them true.

---

## Vision

The dominant model of global information today is monolingual and monocultural. We read what our algorithms feed us, in our native tongue, filtered through the assumptions of our own civilization.

**Objective Info Retriever** is a small step toward a different model: one where anyone can step outside their linguistic reality and observe, with discipline and curiosity, what the rest of the world is actually saying.

We are not building a fact-checker. Facts are rarely the problem. The problem is **frame** — the invisible architecture of assumptions that determines which facts feel important, which sources feel credible, which conclusions feel obvious.

By holding multiple linguistic frames simultaneously — without privileging any one of them — we hope to make a tiny contribution to a more epistemically humble world.

A world where, before you form a strong opinion about a conflict, a policy, or a person, you ask: **what does this look like from the other side of the language wall?**

---

## License

MIT

---

---

# 客观信息检索器

**打破语言壁垒，看见真实世界。**

---

## 问题：你所知道的，不过是你所用语言所告诉你的

我们生活在一个信息极度丰富的时代——然而，我们大多数人对世界的认知却极为贫乏。

不是因为真相被隐藏。而是因为真相往往用我们读不懂的语言书写。

每天，数十亿人通过新闻获取信息、形成观点、对世界作出判断——而这一切都建立在现实的单一语言切片之上。英语世界读路透社和BBC；阿拉伯语世界读半岛电视台和本地评论员；中文世界读微博和微信公众号。每个信息生态都在内部自洽地运转，也都根本性地残缺不全。

这不是宣传。这不是审查（尽管审查也存在）。这是某种更隐蔽、更普遍的东西：**语言本身构筑的认知牢笼。**

### 一个具体的例子：抖音与伊朗，截然不同的两个故事

2024年，TikTok与伊朗之间的关系成为西方媒体的焦点话题。英语媒体将其定性为算法放大伊朗国家叙事、国家安全威胁、地缘政治影响力渗透。

与此同时，来自中东的阿拉伯语媒体——基于真实的生活经验——讲述了一个截然不同的故事：平台内容审核标准不一，巴勒斯坦和伊朗声音随政治气候的变化时而被屏蔽时而被放大。

两种视角都包含真实的观察。任何一种视角单独来看，都不是完整的图景。

一个英语读者和一个阿拉伯语读者搜索同一个话题，得出了几乎完全相反的结论——不是因为有人在撒谎，而是因为**每个人都在自己信息地平线的范围内说出了他所看见的真相**。

### 另一个例子：欧盟发言人的评论区困境

当欧盟发言人在社交媒体上就外交政策发声时，评论区会沿语言断层线撕裂。英语评论者争论程序合法性和国际法；俄语评论者援引历史积怨与北约东扩叙事；德语评论者在大西洋主义立场与经济实用主义之间撕裂。

欧盟发言人并非在对多个受众讲话——他们只说了一次，话语落入虚空，瞬间在不同语言社群之间碎裂成十几种互不相容的现实。

**误解不是例外。它是跨文化沟通的默认状态。**

---

## 解决方案：跨语言信息智能

**Objective Info Retriever** 是一个工具，它同时以多种语言检索同一个问题——然后用AI呈现不同语言社群在说什么、在哪里达成共识、在哪里产生分歧。

它不告诉你该怎么想。它向你展示正在被思考的完整图景。

### 它如何工作

1. **多语言并行检索**：提交一个查询，同时获取英语、中文、法语、德语、俄语、阿拉伯语、西班牙语、葡萄牙语的搜索结果——每种语言都通过相应的地区搜索环境获取。

2. **跨语言分析**：自动识别在多个语言社群中共同出现的主题（共识），以及仅在某一语言圈内出现的主题（分歧）。

3. **结构化报告**：生成包含各语言视角、可信度评分、信源多样性指标和参考文献列表的结构化情报报告。

4. **Web界面**：简洁的浏览器操作界面——输入查询，选择语言，阅读报告。

---

## 技术架构

```
┌─────────────────────────────────────────────────┐
│              网页界面 (public/)                   │
│              基于浏览器的查询界面                  │
└────────────────────┬────────────────────────────┘
                     │ POST /api/search
┌────────────────────▼────────────────────────────┐
│            Express 服务器 (server.ts)             │
└──────────┬──────────────────────┬───────────────┘
           │                      │
┌──────────▼──────────┐  ┌────────▼──────────────┐
│   多语言搜索器        │  │     报告生成器          │
│   (Brave API)        │  │                       │
│                      │  │  - 各语言视角统计       │
│   7种语言并行查询      │  │  - 共识点检测          │
│   通过 Brave Search  │  │  - 分歧点分析           │
└──────────────────────┘  └───────────────────────┘
```

**支持语言：** 英语、中文（简体）、法语、德语、俄语、西班牙语、葡萄牙语

**搜索后端：** [Brave Search API](https://brave.com/search/api/) — 选择该API是因为其独立于谷歌/必应生态，并支持基于语言和国家的定向查询。

---

## 快速上手

### 环境要求

- Node.js 18+
- [Brave Search API](https://brave.com/search/api/) 密钥（有免费额度）

### 安装

```bash
git clone https://github.com/your-username/objective-info-retriever.git
cd objective-info-retriever
npm install
```

### 配置

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 Brave API 密钥：
# BRAVE_API_KEY=你的密钥
```

### 启动

```bash
# 开发模式（热重载）
npm run dev

# 生产构建
npm run build
npm start
```

在浏览器中打开 `http://localhost:3000`。

### API 调用示例

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "抖音 伊朗 内容审核",
    "languages": ["zh", "ar", "en", "fr"]
  }'
```

---

## 愿景

当今全球信息的主流模式是单语言的、单文化的。我们读算法喂给我们的内容，用母语阅读，经过自身文明假设的过滤。

**Objective Info Retriever** 是迈向另一种模式的小小一步：让任何人都能走出自己的语言现实，以严谨和好奇的态度，观察世界其他地方正在真正讨论什么。

我们不是在构建一个事实核查工具。事实本身很少是问题所在。问题在于**框架**——那套无形的假设架构，决定了哪些事实显得重要，哪些信源显得可信，哪些结论显得理所当然。

通过同时持有多个语言框架——不偏袒其中任何一个——我们希望为一个认识论上更加谦逊的世界贡献一点微小的力量。

一个这样的世界：在你对某场冲突、某项政策、某个人形成强烈观点之前，你会先问一句：**从语言之墙的另一侧看，这件事是什么样子的？**

---

## 开源协议

MIT
