# Contributing to Aura

Thanks for your interest in contributing! This guide covers local setup, the quality gates every
change must pass, and how releases are cut.

## Development setup

```bash
npm install
npm run dev              # vite dev server
npm test                 # vitest (watch mode)
npm run type-check       # tsc --noEmit
npm run lint              # eslint
npm run format             # prettier --write src/
```

Before opening a PR, run the quality gate:

```bash
npm run quality   # type-check + lint + format:check + test
```

CI runs the same gate, but replaces the plain test run with a **coverage gate** — the thresholds in
`vitest.config.ts` (statements/functions/lines 95%, branches 88%) must hold, so a coverage
regression turns the build red. Reproduce it locally with:

```bash
npm run test:coverage:ci   # vitest run --coverage (exits non-zero below any threshold)
```

## Conventions

- **TSX only** — every component is `defineComponent` + the `h()` render function, no `.vue`
  single-file components.
- Path alias `@` → `src/`.
- Tests are colocated in `__tests__/` folders next to the code they cover (`*.test.ts` /
  `*.test.tsx`); every new feature or fix is expected to ship tests.
- ESLint is strict (SonarJS rules): `no-duplicate-string`, `cognitive-complexity` (max 15),
  `no-identical-functions`, `consistent-type-imports`.
- When adding a feature or changing behavior, update `CHANGELOG.md` (`[Unreleased]` section, Keep
  a Changelog format) and `README.md` / `README.hu.md` in the same change.
- **Config keys, props and labels are documentation-gated.** `src/__tests__/docs-coverage.test.ts`
  fails if a member of `AuraConfig`/`AuraProps` has no section of its own (or a config-table row)
  in **both** `README.en.md` and `README.hu.md`, if an `AuraLabels` key is missing from either
  key list, or if the label count stated in those lists has drifted. Adding a key therefore means
  documenting it in the same change — the gate names exactly what is missing.
- **Response-section validators are contract-tested as a family.** Every wrapper under
  `src/validators/schemas/response/` that reports a finding and then rethrows is covered by
  `src/validators/schemas/response/__tests__/response-wrapper.contract.test.ts` — a table-driven
  `describe.each` (the response-side counterpart of the config-side
  `schemas/__tests__/schema-wrapper.contract.test.ts`). A drift guard in that file scans the
  folder and fails, naming the file, if a new wrapper has no row in the table. Adding a response
  section therefore means adding one row — valid input, invalid input, and the reported
  component/key — not writing a new suite from scratch.

- **Response-sourced keys read a dictionary through `readOwnEntry` / `hasSafeOwnKey`.**
  `src/__tests__/registry-lookups.test.ts` type-checks the whole plugin and fails, naming
  `file:line  expression`, on any `object[key]` **read** whose key widens to `string` unless
  one of two proofs covers it: the read goes through `hasSafeOwnKey` / `readOwnEntry`, or the
  key came from an `Object.keys` / `Object.entries` walk of that same object. Plain bracket
  access walks the prototype chain, so a response value of `'constructor'` finds a callable
  and `'__proto__'` an object — both truthy, both surviving the caller's `if (entry)` check.
  A key the compiler has already narrowed to a literal union is out of scope: the type is the
  proof. There is no exception list, so a new registry cannot opt out — either prove it or
  route it through `src/utils/safe-object.util.ts`.

- **Exported symbols need a JSDoc block.** `src/__tests__/jsdoc-coverage.test.ts` walks the
  non-test sources with the TypeScript AST and fails, naming `file:line  symbol`, if an
  exported declaration has no JSDoc. It is a presence check, not a quality check — but it
  also catches the failure mode that is invisible when reading the file: a doc block that
  starts on the same line as the previous token (`} /**`) attaches to the declaration
  *above* it, so a symbol that looks documented is not. Re-export statements are out of
  scope; document the declaration, not every barrel that forwards it.

- **Comments are English in every version-controlled file.** `src/` comments were unified to
  English on 2026-07-09, and the convention was extended to the whole repository on 2026-08-11 —
  build and tooling configs (`vite.config.ts`, `vitest.config.ts`, `eslint.config.js`,
  `aura.config.ts`), the package entry point (`index.ts`), the CI workflows, the SCSS sources and
  `examples/` included (see `CHANGELOG.md`). A public package is expected to read cleanly for
  external contributors from the entry point outwards. The maintainer's working language is still
  Hungarian for discussion, commit messages, `README.hu.md`, `CHANGELOG.md`, and internal docs,
  but every code comment should be written in English.

## Pull requests

- Keep PRs focused — one feature or fix per PR.
- Ensure `npm run quality` passes locally and CI is green.
- Update `CHANGELOG.md` and the relevant README section(s) as part of the same PR.

## Versioning

Aura follows [Semantic Versioning](https://semver.org/), but is currently pre-1.0 (`0.x`). Per
semver, **any `0.x` release may include breaking changes**, most often on a minor version bump.
`1.0.0` will be cut once the API has seen real-world external usage and is considered stable.

## Release process

Releases are cut from `main` and published by CI, not from a local machine:

1. Move the `CHANGELOG.md` `[Unreleased]` section into a new `## [X.Y.Z] - YYYY-MM-DD` entry.
2. Bump `"version"` in `package.json` to match.
3. Commit (e.g. `chore: release vX.Y.Z`) and push to `main`.
4. Tag the commit and push the tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
5. The [`Release`](./.github/workflows/release.yml) GitHub Actions workflow triggers on the tag
   push: it re-runs the full quality gate, verifies the tag matches `package.json`'s version,
   builds, publishes to npm with
   [provenance](https://docs.npmjs.com/generating-provenance-statements)
   (`npm publish --provenance`), and creates a GitHub Release.

Publishing requires an `NPM_TOKEN` repository secret (an npm automation token with publish rights
on `@tamas-labs/aura`).

## Security

See [SECURITY.md](./SECURITY.md) for how to report vulnerabilities.
