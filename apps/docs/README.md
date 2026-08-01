# React Native Showcase docs

The documentation site is a Fumadocs app. It contains installation guides,
copyable source, interaction notes, and recorded previews for the showcase.

Run it from the repository root:

```bash
pnpm dev:docs
```

Open http://localhost:3000 with your browser to see the result.

## Content

- `content/docs/components`: source-first component guides
- `content/docs/interactions`: reusable interaction patterns
- `content/docs/showcases`: larger visual experiments
- `public/videos`: recorded previews used at the top of entry pages
- `src/components`: Fumadocs and registry-powered UI components

Edit an MDX page, then reload the dev server. Package-manager tabs use a shared
persisted group so a reader's selection carries across documentation pages.

## Checks

```bash
pnpm --filter @rn-showcase/docs lint
pnpm --filter @rn-showcase/docs typecheck
pnpm --filter @rn-showcase/docs build
```

The docs build can require permission to create local Turbopack worker
processes. The root `pnpm check` command runs the docs checks alongside the
showcase checks.

For Fumadocs-specific behavior, see the
[Fumadocs documentation](https://fumadocs.dev).
