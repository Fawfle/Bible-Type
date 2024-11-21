 export function countWords(str) {
  return str.trim().split(/\s+/).length;
}

export function formatNumber(num) {
  return Math.round(num * 100) / 100;
}
