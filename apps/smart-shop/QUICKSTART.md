# Quick Start Guide

Get Smart Shop running in 5 minutes!

## 1. Install Dependencies

```bash
cd smart-shop
pnpm install
```

## 2. Configure API Key

Create `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your API key:

**Option A: OpenAI**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
```

**Option B: Anthropic**
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE
```

## 3. Sync Design Tokens

```bash
pnpm sync:tokens
```

## 4. Start Development Server

```bash
pnpm dev
```

## 5. Open Browser

Visit [http://localhost:3000](http://localhost:3000)

## What's Included

✅ **12 Sample Products** across 4 categories
✅ **6 CMS Pages** with different layouts
✅ **5 AI Agents** ready to use
✅ **Design Token System** with light/dark themes
✅ **Streaming AI Chat** API
✅ **Voice Shopping** capability
✅ **Vector Search** for products
✅ **Cart Management** with Zustand
✅ **Full TypeScript** type safety

## Next Steps

- **Browse Products**: Visit `/category/all`
- **Try AI Chat**: Call `/api/ai/chat` with messages
- **Edit Design Tokens**: Modify `content/design-tokens.json`
- **Add Products**: Edit `content/products.json`
- **Create Pages**: Edit `content/pages.json`

## Troubleshooting

**Port already in use?**
```bash
pnpm dev -- -p 3001
```

**API key not working?**
- Check `.env.local` exists in project root
- Verify `AI_PROVIDER` matches your key type
- Restart dev server after changing .env

**Design tokens not updating?**
```bash
pnpm sync:tokens
# Then restart: pnpm dev
```

## Full Documentation

See [README.md](./README.md) for complete documentation.
