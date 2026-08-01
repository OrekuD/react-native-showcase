# Registry

The source manifest used by `@rn-showcase/cli` and the documentation site.

Registry entries describe their source files, destination filenames,
dependencies, and native setup requirements. The CLI bundles these entries when
it is built.

## Entry shape

Each entry lives in `packages/registry/items/<name>/registry.json`:

```json
{
  "name": "button",
  "files": [
    {
      "source": "../../../../apps/showcase/src/components/ui/Button.tsx",
      "target": "Button.tsx"
    }
  ],
  "expoDependencies": [],
  "dependencies": [],
  "requiresPrebuild": false
}
```

Keep registry sources pointed at the copyable files in the showcase app. Add the
matching documentation page and tests when introducing a new entry.
