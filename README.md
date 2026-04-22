# Jash-Muun · Living Heritage

A digital exhibition platform for intangible cultural heritage from Kyrgyz mountain communities. Built as an immersive, editorial experience — not a landing page.

## Stack

- **Framework:** SvelteKit 2
- **Language:** TypeScript + Svelte 5 (runes)
- **Styling:** Tailwind CSS v3 + custom CSS
- **Rendering:** SSR + client-side interactions

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run datocms:schema` | Fetch local DatoCMS GraphQL schema snapshot |
| `npm run check` | Type-check Svelte components |

## DatoCMS

1. Create `.env` from `.env.example`.
2. Set `DATO_CMS_READONLY_TOKEN` to a DatoCMS Content Delivery API token.
3. Run `npm run datocms:schema` to fetch a local schema snapshot for GraphQL-aware editors.

The project ships with `graphql.config.cjs`. Editors can validate GraphQL queries embedded in `src/**/*.{ts,svelte}` against DatoCMS. The config prefers a local `.generated/datocms-schema.json` snapshot and falls back to the live DatoCMS endpoint when a token is available.

## Project structure

```
src/
├── routes/
│   ├── +layout.svelte       Root layout
│   └── +page.svelte         Homepage (horizontal scroll)
└── lib/
    └── components/
        ├── layout/          Header, ScrollProgress
        ├── sections/        Hero, Footer
        └── ui/              PracticeCard
```

## Partners

Supported by [ALIPH](https://www.aliph-foundation.org) and Jash-Muun Foundation.
