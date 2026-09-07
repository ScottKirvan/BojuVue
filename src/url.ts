// Reimplements VPButton's own external-link detection (`EXTERNAL_URL_RE` in
// vitepress's client/shared.js). Reimplemented rather than imported so
// anything using this stays free of any dependency on the `vitepress`
// package. Shared by BVPlatformButton and BVMoreButton, both of which need
// the identical smart target/rel default for a resolved href.
const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i

export function isExternalUrl(href: string): boolean {
  return EXTERNAL_URL_RE.test(href)
}

// Reimplements VitePress's own withBase()/joinPath() (client/app/utils.js) —
// prefixes a root-relative path with the site's base, leaving external URLs
// and non-root-relative paths untouched. Reimplemented for the same zero-
// vitepress-dependency reason as isExternalUrl above: this is the one piece
// of VPButton-adjacent behavior BVIconButton's icon-only mode needs (base-
// prefixing a caller-supplied href), and it doesn't depend on anything else
// VitePress's real withBase() reads (no cleanUrls handling — that's only
// relevant to VPButton's own markdown-link normalization, not a raw href).
export function joinBase(base: string, path: string): string {
  if (isExternalUrl(path) || !path.startsWith('/')) return path
  return `${base}${path}`.replace(/\/+/g, '/')
}
