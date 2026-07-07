export function isValidIconUrl(url: string): boolean {
  return url === '' || /^https?:\/\/.+/i.test(url);
}
