# @rn-showcase/cli

Copy React Native Showcase components into your project.

```bash
npx @rn-showcase/cli add button
```

The CLI writes source files to `components/ui` by default and installs the
entry's dependencies using the package manager detected from your lockfile.

Use `--path` to choose another destination, `--overwrite` to replace existing
files, or `--skip-dependencies` to copy source only.

```bash
npx @rn-showcase/cli add button --path src/components/ui
```
