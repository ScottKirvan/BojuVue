// Reimplements VPButton's own external-link detection (`EXTERNAL_URL_RE` in
// vitepress's client/shared.js). Reimplemented rather than imported so
// anything using this stays free of any dependency on the `vitepress`
// package. Shared by BVPlatformButton and BVMoreButton, both of which need
// the identical smart target/rel default for a resolved href.
const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i

export function isExternalUrl(href: string): boolean {
  return EXTERNAL_URL_RE.test(href)
}
