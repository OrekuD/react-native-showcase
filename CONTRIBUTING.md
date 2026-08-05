# Contributing

React Native Showcase is a source-first project. Components, interactions, and
showcases should be understandable when copied into an application and should
keep their dependencies visible.

## Setup

Use Node.js 22.13 or newer and pnpm 11.8:

```bash
pnpm install
pnpm expo:prebuild
pnpm ios
```

Run the documentation site with `pnpm dev:docs` and the Expo app with
`pnpm dev:showcase`.

## Adding an entry

1. Add or update the source under `apps/showcase/src`.
2. Add focused tests for formatting, state, or theme logic.
3. Add a registry manifest under `packages/registry/items/<name>` when the
   source should be copyable.
4. Add the matching MDX page under `apps/docs/content/docs`.
5. Add or update a Maestro flow and recorded preview when the entry has a
   meaningful interaction.

Keep component APIs composable and preserve reduced-motion and accessibility
behavior. Avoid adding a dependency when the behavior can remain source-first.

## Checks

Before opening a change, run the smallest relevant checks and then the full
workspace check when practical:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use `pnpm record [name]` to regenerate a specific docs video or all recordings.

## Commits

Use conventional commit prefixes such as `feat:`, `fix:`, `docs:`, and
`chore:`. Do not commit npm tokens, local credentials, generated native build
artifacts, or dependency caches.

## CLI releases

The published package is `@rn-showcase/cli`. GitHub Actions publishes it when a
`cli-v<version>` tag is pushed. The tag must match the version in
`packages/cli/package.json`.

### One-time npm setup

After the first manual publish creates the package, open the package settings on
npmjs.com and add a Trusted Publisher with these exact values:

- Provider: GitHub Actions
- Organization or user: `OrekuD`
- Repository: `react-native-showcase`
- Workflow filename: `publish-cli.yml`
- Environment: leave empty
- Allowed action: `npm publish`

npm Trusted Publishing uses a short-lived OIDC identity, so no npm access token
belongs in GitHub secrets. The first package publish still needs to be done
locally because npm package settings do not exist until the package is created:

```bash
npm login
npm whoami
cd packages/cli
npm publish --access public
```

### Release a new CLI version

Update `packages/cli/package.json` and its `CHANGELOG.md`, commit the changes,
then push a matching tag:

```bash
git tag cli-v0.1.1
git push origin cli-v0.1.1
```

The workflow tests and builds the CLI, publishes it with provenance, and creates
the GitHub Release. The npm version badge in the repository README updates from
the registry after publication.
