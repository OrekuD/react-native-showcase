<p align="center">
  <img src="./assets/brand/react-native-showcase-logo.png" alt="React Native Showcase logo" width="112" />
</p>

# React Native Showcase

[![CI](https://github.com/OrekuD/react-native-showcase/actions/workflows/ci.yml/badge.svg)](https://github.com/OrekuD/react-native-showcase/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40rn-showcase%2Fcli?logo=npm)](https://www.npmjs.com/package/@rn-showcase/cli)
[![npm downloads](https://img.shields.io/npm/dm/%40rn-showcase%2Fcli?logo=npm)](https://www.npmjs.com/package/@rn-showcase/cli)

A source-first library of React Native components, interactions, and visual
experiments. Each entry is designed to be copied into an application, studied,
and adapted rather than hidden behind a package API.

> React Native Showcase is in early development. The mobile gallery, docs, and
> first registry entry are working; the CLI is not published yet.

## What is included

The library is intentionally small while its component format and copy workflow
settle.

- **Components:** Button, Input, and Switch
- **Interactions:** Rolling currency
- **Showcases:** larger Skia, gesture, and motion experiments will live here

The Expo app is the review surface for every entry. The Fumadocs site explains
usage, dependencies, behavior, and implementation details.

## Repository structure

| Path | Purpose |
| --- | --- |
| `apps/showcase` | Expo 57 app containing the component and motion gallery |
| `apps/docs` | Next.js and Fumadocs documentation site |
| `packages/registry` | Source registry for copyable entries and dependency metadata |
| `packages/cli` | `@rn-showcase/cli` for adding registry entries to React Native apps |

The monorepo uses pnpm workspaces and Turborepo.

## Requirements

- Node.js 22.13 or newer
- pnpm 11.8
- Xcode and CocoaPods for iOS development
- Android Studio and the Android SDK for Android development

The mobile app contains native modules, so use a native development build rather
than Expo Go.

## Setup

Install the workspace dependencies from the repository root:

```bash
pnpm install
```

Generate the native iOS and Android projects:

```bash
pnpm prebuild
```

Build and install the mobile app on a simulator or connected device:

```bash
pnpm ios
# or
pnpm android
```

Run `pnpm prebuild` again after adding a native dependency or changing native
Expo configuration. Normal TypeScript and React changes do not require another
prebuild.

## Development

Start the Expo and documentation development servers together:

```bash
pnpm dev
```

This starts Metro and Next.js, but it does not compile or reinstall the native
app. Use `pnpm ios` or `pnpm android` when a new native build is required.

Run either application independently:

```bash
pnpm dev:showcase
pnpm dev:docs
```

## Root commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start all development servers |
| `pnpm dev:showcase` | Start Expo Metro only |
| `pnpm dev:docs` | Start Fumadocs only |
| `pnpm ios` | Build and launch the iOS app |
| `pnpm android` | Build and launch the Android app |
| `pnpm record [name] [--platform ios\|android\|all]` | Generate both platform docs videos, or one platform for a named flow |
| `pnpm prebuild` | Regenerate native projects |
| `pnpm prebuild:clean` | Regenerate native projects from a clean state |
| `pnpm lint` | Lint workspace packages |
| `pnpm typecheck` | Type-check workspace packages |
| `pnpm test` | Run workspace tests |
| `pnpm build` | Build the workspace |
| `pnpm check` | Run lint, typecheck, tests, and builds |

## CI/CD

Pull requests and pushes to `main` run the workspace checks in GitHub Actions.
CLI releases are tag-driven: the `cli-v0.1.1` tag publishes the version in
`packages/cli/package.json` and creates a matching GitHub Release.

The npm publish workflow uses Trusted Publishing with GitHub's OIDC identity,
so no npm token is stored in the repository. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for the one-time npm setup and release
commands.

## Project principles

- **Source first:** users own and modify every copied file.
- **React Native focused:** examples are designed for native applications, not
  translated from web-only patterns.
- **Dependencies stay visible:** every entry documents the packages it needs.
- **Motion should communicate:** animation supports state, hierarchy, and
  feedback rather than existing only as decoration.
- **Accessibility is part of the implementation:** reduced motion and native
  interaction behavior are considered from the beginning.

## Roadmap

- Settle the source format for components, interactions, and showcases
- Add live previews, source copying, and AI implementation prompts to the docs
- Expand the registry beyond the Button
- Publish `@rn-showcase/cli`
- Expand the interaction and Skia showcase collections

## Links

- [Documentation](./apps/docs)
- [Expo showcase app](./apps/showcase)
- [GitHub repository](https://github.com/OrekuD/react-native-showcase)

## License

React Native Showcase is released under the [MIT License](./LICENSE). The
published `@rn-showcase/cli` package includes the same license.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development and release guidance.
