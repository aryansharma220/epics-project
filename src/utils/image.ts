export function getOptimizedImageUrl(url: string, width: number, height: number): string {
  return `${url}?auto=format,compress&q=90&fit=crop&w=${width}&h=${height}`;
}
