/**
 * Utility to normalize local absolute paths to website root-relative paths (/works/...).
 *
 * Handles:
 * - Local Windows absolute paths (e.g. C:\Users\...\public\works\cover.jpg -> /works/cover.jpg)
 * - Local Unix / macOS absolute paths (e.g. /Users/...\public\works\1.jpg -> /works/1.jpg)
 * - file:/// URI protocol paths (e.g. file:///C:/Users/... -> /works/...)
 * - Public folder references (e.g. public/works/... or /public/works/... -> /works/...)
 * - Bare relative paths (e.g. works/project-1.jpg -> /works/project-1.jpg)
 * - Preserves http://, https://, data: and blob: URLs untouched.
 */
export function toRootRelativePath(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Preserve external network URLs, base64 data URLs, and browser Blob URLs
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  // 1. Remove file:// protocol if present
  let clean = trimmed.replace(/^file:\/\/\/?/i, '');

  // 2. Normalize Windows backslashes to forward slashes
  clean = clean.replace(/\\/g, '/');

  // 3. If path contains /public/ or starts with public/, extract everything after public
  const publicMatch = clean.match(/(?:^|\/)public\/(.+)$/i);
  if (publicMatch && publicMatch[1]) {
    return `/${publicMatch[1]}`;
  }

  // 4. If path starts with Windows drive letter like C:/Users/... or Unix /Users/... or /home/...
  if (/^[a-zA-Z]:\//.test(clean) || clean.startsWith('/Users/') || clean.startsWith('/home/')) {
    const assetMatch = clean.match(/(?:works|images|videos|assets|media|static)\/.+$/i);
    if (assetMatch) {
      return `/${assetMatch[0]}`;
    }
    const fileName = clean.split('/').filter(Boolean).pop();
    if (fileName) {
      return `/works/${fileName}`;
    }
  }

  // 5. If it starts with './', strip the dot to make it root-relative
  if (clean.startsWith('./')) {
    clean = clean.slice(1);
  }

  // 6. Ensure it starts with '/' for standard website root-relative path
  if (!clean.startsWith('/')) {
    clean = `/${clean}`;
  }

  return clean;
}
