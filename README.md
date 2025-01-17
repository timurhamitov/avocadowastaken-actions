# umidbekk/actions

[![Checks](https://github.com/umidbekk/actions/actions/workflows/checks.yml/badge.svg)](https://github.com/umidbekk/actions/actions/workflows/checks.yml)

Collection of reusable GitHub Actions

## NPM

### Install

#### Features:

- Install packages using `npm` or `yarn`
- Caches whole `node_modules` directory
- Skips installation step when lockfile cache is hit.

#### Options:

- `working-directory` – the default working directory
- `cache-key` – an explicit key for restoring and saving the cache

#### Usage:

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: umidbekk/actions/npm/install@v1
```

Passing `cache-key`

```yaml
strategy:
  matrix:
    node: ["14", "16", "18"]
steps:
  - uses: actions/checkout@v2
  - uses: actions/setup-node@v2
    with:
      node-version: ${{ matrix.node }}
  - uses: umidbekk/actions/npm/install@v1
    with:
      cache-key: npm-${{ matrix.node }}-
```
