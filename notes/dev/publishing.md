# Publishing notes

Working notes from renaming `@scottkirvan/bojuvue` → `bojuvue` and publishing it,
4 September 2026.

**Read the volatility warning before trusting anything in Part 2.** npm's
authentication rules are changing fast right now. The concepts in Part 1 have been
stable for a decade; the procedures in Part 2 may already be wrong by the time you
read this.

---

## Part 1 — Durable

These don't change with npm policy.

### Three separate namespaces

Account names, organization names, and package names are independent of each other.

- **Account and org names share one namespace.** This is why `boju` was refused as an
  org name even though no package named `boju` exists and nothing was published under
  a `@boju` scope — a dormant user account with zero packages holds the name and is
  invisible to any registry search.
- **Package names are their own namespace.** You do not need an account named `x` to
  publish a package named `x`. Only the `name` field in package.json matters.
- Checking `scope:foo` in the registry search API tells you nothing about whether the
  org name `foo` is available. Different question, different namespace.

### The first account to publish becomes the owner

And it shows as the maintainer on the package page forever after. Moving ownership
later means `npm owner add <user>` → the other account accepts an emailed invitation →
`npm owner rm <you>`. Decide which identity you want on the page *before* the first
publish, not after.

Scoped packages can't be transferred between user accounts at all — you have to
republish under the new scope.

### Unscoped vs scoped

- `bojuvue` — shorter import, brand reads as one word, no personal name in consumers'
  code.
- `@someone/bojuvue` — puts an identity in every import statement. Fine for an org,
  reads as a personal side project when it's a person's name.
- Orgs can own unscoped packages, which is the combination worth having: clean name,
  ownership that transfers properly.

### `npm version` requires a clean git tree

It makes its own commit and tag, so it refuses to run with uncommitted changes —
including the package.json changes `npm pkg set` just made. Either commit first, or
use `npm version x.y.z --no-git-tag-version` and handle git yourself.

### Always dry-run before a first publish under a new name

```bash
npm publish --dry-run
```

Prints the exact file list and tarball size. This is what catches shipping your whole
`src/`, or shipping nothing because `dist/` wasn't built. The `files` field in
package.json controls it; npm always adds README, LICENSE and package.json regardless.

A good result for this package looked like: 36 files, 14.5 kB packed, 52.4 kB
unpacked, `dist/` only.

### Deprecate, never unpublish

```bash
npm deprecate @scottkirvan/bojuvue "Renamed — install 'bojuvue' instead."
```

Anyone installing the old name gets a warning pointing at the new one. Unpublishing
breaks builds for anyone who already depends on it and the name becomes unusable.

---

## Part 2 — As of 4 September 2026 (expect this to change)

npm is actively hardening publishing against supply-chain attacks — stolen maintainer
credentials, self-propagating malicious packages. The direction of travel is:
phishing-resistant auth, short-lived credentials, no long-lived secrets. Assume
anything specific below has a shelf life of months.

### 2FA is mandatory to publish

Publishing requires either 2FA enabled on the account, or a granular access token with
"bypass 2FA" enabled. Without one of those you get a 403 (see Part 4).

Check status with:

```bash
npm profile get     # look at the "two-factor auth" line — want "auth-and-writes"
npm whoami          # confirm which account you're actually publishing as
```

### TOTP authenticator apps are gone

npm's 2FA is now security-key / WebAuthn only — Windows Hello, Touch ID, passkeys,
hardware keys like YubiKey. There is no 6-digit code, so `--otp=` no longer applies to
a normal interactive publish; the CLI prompts and hands off to the browser instead.
Configuration is web-only, even though authentication works from the CLI.

### Granular access tokens

For automation, or when the browser handoff won't work:

```bash
npm config set //registry.npmjs.org/:_authToken npm_xxxxxxxx
```

Scope the token to the single package where possible. Treat it as a credential —
never commit it. npm has explicitly warned that tokens which bypass 2FA are being
restricted, so don't build a release process that depends on them lasting.

### Where this is heading

Trusted publishing (OIDC from CI, no long-lived tokens at all) is the direction npm is
pushing for automated releases. **This is now done for BojuVue — see Part 6 for
how it was set up and the non-obvious failure modes hit along the way.**

---

## Part 3 — WSL specifics

### npm login can't open a browser

```
npm error Set the BROWSER environment variable to your desired browser.
```

Fix — a wrapper avoids the spaces-in-path problem that breaks a bare `BROWSER=` path:

```bash
mkdir -p ~/bin
cat > ~/bin/chrome <<'EOF'
#!/bin/sh
exec "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" "$@"
EOF
chmod +x ~/bin/chrome
echo 'export BROWSER="$HOME/bin/chrome"' >> ~/.bashrc
```

Remember it won't be set in a shell opened before that line was added.

### Every file showing as modified

`git status` listing all ~85 tracked files as modified, with no real content changes,
is a line-ending mismatch — CRLF in the working tree against LF in the index.

Diagnose:

```bash
git diff --stat -w | tail -3     # empty output = whitespace only, nothing real at risk
file src/index.ts                # look for "with CRLF line terminators"
git config core.autocrlf
```

Fix, **only** once `git diff -w` is confirmed empty:

```bash
git config core.autocrlf false
git reset --hard
```

Permanent fix — commit a `.gitattributes`:

```
* text=auto eol=lf
```

### Keep the repo on the Linux filesystem

`~/projects/...`, not `/mnt/c/...`. npm through the Windows filesystem is much slower
and occasionally hits permission oddities.

---

## Part 4 — Verbatim errors from this session

Kept exactly as printed. Error text is what people paste into search boxes.

**Browser handoff, `npm login` in WSL:**

```
npm notice Log in on https://registry.npmjs.org/
Login at:
https://www.npmjs.com/login?next=/login/cli/xxxx
Press ENTER to open in the browser...
npm error Set the BROWSER environment variable to your desired browser.
```

**`npm version` after `npm pkg set`:**

```
npm error Git working directory not clean.
```

**Publish without 2FA configured:**

```
npm error code E403
npm error 403 403 Forbidden - PUT https://registry.npmjs.org/bojuvue - Two-factor
authentication or granular access token with bypass 2fa enabled is required to
publish packages.
```

**Harmless warning, fixed with `npm pkg fix`:**

```
npm warn publish npm auto-corrected some errors in your package.json when publishing.
npm warn publish "repository.url" was normalized to
"git+https://github.com/ScottKirvan/BojuVue.git"
```

---

## Part 5 — Open items

- [x] `npm pkg fix` to clear the repository.url normalization warning
- [ ] Stop shipping `dist/**/*.test.d.ts` — eleven 11-byte files of type declarations
      for tests that no consumer uses. Exclude tests from the declaration build.
- [ ] Transfer the package to the `scottkirvan` org (package settings page on
      npmjs.com — no CLI equivalent found)
- [x] Commit `.gitattributes` with `* text=auto eol=lf`
- [ ] Set `homepage` once the docs site is on Pages, then republish

---

## Part 6 — OIDC trusted publishing (set up 4 September 2026)

BojuVue's release workflow now publishes via OIDC — no `NPM_TOKEN` required. This
section documents how it was configured and the failure modes hit along the way.

### How it works

1. `release-please` merges a release PR and creates a GitHub release + tag.
2. The `publish-npm` job runs with `id-token: write`.
3. npm detects the GitHub OIDC environment, requests a short-lived token, and
   exchanges it with npmjs.com for publish auth.
4. `npm publish --provenance` publishes the package with a sigstore attestation.

### Configuration

Configured once via CLI (requires npm ≥ 11.15.0):

```bash
npm trust github bojuvue --file release.yml --repo ScottKirvan/BojuVue --allow-publish
```

Verify with:

```bash
npm trust list bojuvue
# expected:
# type: github
# file: release.yml
# repository: ScottKirvan/BojuVue
# permissions: publish, stage publish
```

### Gotchas

**1. Do NOT use `registry-url` in `setup-node`.**

When `registry-url` is set, `setup-node` injects `github.token` as `NODE_AUTH_TOKEN`
into all subsequent steps. npm then authenticates with that token instead of doing the
OIDC exchange — and npmjs.com returns a misleading 404 ("not in this registry") rather
than a 401.

```yaml
# Wrong
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    registry-url: 'https://registry.npmjs.org'  # ← causes silent auth override

# Right
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```

**2. Upgrade npm in the workflow.**

The runner's bundled npm may be too old to support OIDC auth exchange (added in
npm 10.9.0). Upgrade before publishing:

```yaml
- name: Upgrade npm for OIDC trusted publishing support
  run: npm install -g npm@^11
```

**3. Reading the error codes.**

- `E404 "not in this registry"` — likely `registry-url` is set and github.token is
  being used for auth. Remove `registry-url`.
- `ENEEDAUTH "need auth"` — the OIDC exchange isn't happening. Usually the runner's
  npm is too old. Upgrade npm.
- Both errors can look like a misconfigured trusted publisher when they're not — verify
  the config with `npm trust list` before changing npmjs.com settings.

### Working workflow snippet

```yaml
publish-npm:
  runs-on: ubuntu-latest
  permissions:
    contents: read
    id-token: write
  steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        # no registry-url — would inject github.token and break OIDC auth

    - name: Upgrade npm for OIDC trusted publishing support
      run: npm install -g npm@^11

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Publish to npm
      run: npm publish --provenance --access public
      # no NODE_AUTH_TOKEN — OIDC handles auth automatically
```

---

## Note on scope

These are **publishing** notes. They are not the material for the anchor post.

That post is about what breaks when you publish Vue components for VitePress —
duplicate Vue instances, injection warnings, peer dependency resolution, the two-entry
build. Those errors came from the library work, not from this publish session, and
they still need collecting from that earlier work while the details are recoverable.
Separate file.
