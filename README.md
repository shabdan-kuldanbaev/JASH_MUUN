# Jash-Muun · Living Heritage

A digital exhibition platform for intangible cultural heritage from Kyrgyz mountain communities. Built as an immersive, editorial experience — not a landing page.

## Stack

- **Framework:** SvelteKit 2
- **Language:** TypeScript + Svelte 5 (runes)
- **Styling:** Tailwind CSS v3 + custom CSS
- **Rendering:** SSR + client-side interactions

## Getting started

```bash
yarn install
yarn dev
```

Open [http://localhost:5173](http://localhost:5173).

## Commands

| Command | Description |
|---|---|
| `yarn dev` | Start dev server |
| `yarn build` | Production build |
| `yarn preview` | Preview production build |
| `yarn datocms:schema` | Fetch local DatoCMS GraphQL schema snapshot |
| `yarn i18n:compile` | Regenerate Paraglide runtime from message catalogs |
| `yarn run check` | Type-check Svelte components |
| `yarn lint` | Run ESLint across the project |
| `yarn lint:fix` | Apply safe ESLint fixes |

## DatoCMS

1. Create `.env` from `.env.example`.
2. Set `DATO_CMS_READONLY_TOKEN` to a DatoCMS Content Delivery API token.
3. Run `yarn datocms:schema` to fetch a local schema snapshot for GraphQL-aware editors.

The project ships with `graphql.config.cjs`. Editors can validate GraphQL queries embedded in `src/**/*.{ts,svelte}` against DatoCMS. The config prefers a local `.generated/datocms-schema.json` snapshot and falls back to the live DatoCMS endpoint when a token is available.

## Linting

ESLint is the primary linter for this repository, using the official Svelte flat-config integration from `eslint-plugin-svelte`.

Local workflow:

```bash
yarn lint
yarn lint:fix
```

CI enforcement lives in `.github/workflows/lint.yml`.

## i18n

UI translations are handled by Paraglide JS.

Key files:

- `project.inlang/settings.json` — locale and project config
- `messages/*.json` — source message catalogs
- `src/lib/paraglide/*` — generated runtime and message functions

Current UI locales:

- `ky`
- `en`
- `fr`
- `ru`

The route structure remains locale-prefixed as `/${locale}/...`, and Paraglide locale state is synchronized from the active route param in `src/routes/[locale]/+layout.ts`.

## Deployment

The site is deployed to GitHub Pages through GitHub Actions on pushes to `master`.

Required GitHub repository configuration:

1. `Settings -> Pages -> Source -> GitHub Actions`
2. `Settings -> Secrets and variables -> Actions -> Secrets`
3. Add `DATO_CMS_READONLY_TOKEN` as a repository secret

The workflow uses:

- `yarn` in CI
- Node.js `24`
- `@sveltejs/adapter-static`
- GitHub Pages artifact deploy via `.github/workflows/deploy.yml`

## Project structure

```
src/
├── routes/
│   ├── +layout.svelte       Root layout
│   ├── +page.server.ts      Root redirect
│   └── +page.svelte         Homepage shell
└── lib/
    └── components/
        ├── layout/          Header, ScrollProgress
        ├── sections/        Hero, Footer, Interlude
        └── ui/              PracticeCard
```

## Partners

Supported by [ALIPH](https://www.aliph-foundation.org) and Jash-Muun Foundation.
