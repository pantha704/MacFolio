export function resolveBrowserInput(input: string): { url: string; internal: boolean } | null {
  const text = input.trim()
  if (!text) return null
  // Never navigate javascript:, data:, file:, or other executable/non-web schemes.
  if (/^[a-z][a-z\d+.-]*:/i.test(text) && !/^https?:\/\//i.test(text)) return null
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : text.includes('.') && !/\s/.test(text) ? `https://${text}` : `https://www.google.com/search?q=${encodeURIComponent(text)}`)
  } catch { return null }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
  return { url: url.href, internal: url.hostname === 'github.com' && /^\/pantha704\/?$/i.test(url.pathname) && !url.search && !url.hash }
}
