# Testing Rules

## Test Runner
- **Vitest** is the test runner.
- Run tests: `bun test` (single run), `bun test:watch` (watch mode), `bun test:ui` (browser UI).

## Test Location
- Place tests in the `tests/` directory or alongside components as `<name>.spec.ts`.

## Component Testing
- Use `@vue/test-utils` with `jsdom` environment.

## Pre-deploy Verification
- Run `bun verify` before deploying — this runs lint + format + clean + build + test in sequence.

## i18n Checks
- `bun i18n:check` — CI-friendly check that fails on missing translation keys.
- `bun i18n:report` — generates `i18n-report.json` with missing/unused keys.
