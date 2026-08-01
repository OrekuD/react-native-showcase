# @rn-showcase/cli

[![npm version](https://img.shields.io/npm/v/%40rn-showcase%2Fcli?logo=npm)](https://www.npmjs.com/package/@rn-showcase/cli)
[![CI](https://github.com/OrekuD/react-native-showcase/actions/workflows/ci.yml/badge.svg)](https://github.com/OrekuD/react-native-showcase/actions/workflows/ci.yml)

Copy React Native Showcase components into your project.

## Install

The CLI is intended to be run with your package manager's one-off command. It
does not add a runtime dependency to your app.

```bash
npx @rn-showcase/cli add button
```

The CLI writes source files to `components/ui` by default and installs the
entry's dependencies using the package manager detected from your project.

After installing an entry with native dependencies, run the prebuild command
printed by the CLI and use a development build. Expo Go cannot load native
modules such as `react-native-fast-squircle`.

## Options

Use `--path` to choose another destination, `--overwrite` to replace existing
files, or `--skip-dependencies` to copy source only.

```bash
npx @rn-showcase/cli add button --path src/components/ui
```

The command refuses to overwrite existing files unless `--overwrite` is
provided. This keeps a local customization safe by default.

## Development

From the repository root:

```bash
pnpm --filter @rn-showcase/cli test
pnpm --filter @rn-showcase/cli build
```

The package bundles registry source files during `build`, so the published
tarball is self-contained and does not depend on this repository at runtime.
