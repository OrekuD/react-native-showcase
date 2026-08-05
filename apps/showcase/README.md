# React Native Showcase app

The Expo app is the local review surface for React Native Showcase. It groups
the copyable components, interactions, and future visual experiments into a
small native gallery.

## Requirements

- Node.js 22.13 or newer
- pnpm 11.8
- Xcode and CocoaPods for iOS
- Android Studio and an Android SDK for Android

The app uses native modules including Reanimated, Skia, Fast Squircle, and
Expo UI. It does not run in Expo Go; use an iOS simulator, Android emulator,
or development build.

## Setup

Run these commands from the repository root:

```bash
pnpm install
pnpm expo:prebuild
pnpm ios
```

Use `pnpm android` for an Android emulator. `pnpm expo:prebuild` creates or updates
the native `ios` and `android` projects after native dependencies change.

## Development

Start Metro without rebuilding the native app:

```bash
pnpm dev:showcase
```

The root shortcuts are also available from this package directory:

```bash
pnpm dev
pnpm ios
pnpm android
```

## Source map

- `App.tsx`: navigation container and root stack
- `src/screens`: the screens shown in the gallery
- `src/components/ui`: copyable component source
- `src/features`: interaction-specific logic and formatting helpers
- `src/components`: shared preview layout and animation helpers
- `.maestro`: device flows used for smoke tests and recordings

The matching docs live in `apps/docs/content/docs`. A source entry is only
considered complete when its app preview, tests, registry metadata, and docs
agree.

## Checks and recordings

Run the app tests and typecheck from the repository root:

```bash
pnpm --filter @rn-showcase/showcase test
pnpm --filter @rn-showcase/showcase typecheck
```

Generate both platform previews for one component:

```bash
pnpm record button
```

This requires booted iOS and Android simulators with the development build
installed. Pass `--platform ios` or `--platform android` to record only one.
The source flows live under `apps/showcase/.maestro/recordings` and the videos
are written to `apps/docs/public/videos` with platform suffixes.
