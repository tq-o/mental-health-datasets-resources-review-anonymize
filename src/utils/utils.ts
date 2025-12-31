export function parseDisorders(raw: string) {
  if (!raw) return [];

  const lower = raw.toLowerCase();

  // Find all parenthesis groups and replace with placeholders
  const parenGroups: string[] = [];
  let replaced = lower.replace(/\([^()]*\)/g, (match) => {
    parenGroups.push(match);
    return `__PAREN_${parenGroups.length - 1}__`;
  });

  // Split on delimiters outside parentheses
  let parts = replaced
    .split(/\.|and|,|;/g)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => {
      // Restore parenthesis content
      return s.replace(/__PAREN_(\d+)__/g, (_, idx) => parenGroups[Number(idx)] || '');
    });

  return [...new Set(parts)];
}

// consistent color assignment
// const chipColors = ["primary", "secondary", "success", "warning", "info"];
const chipColors = [
  "#6B7C93",
  "#5F8D8D",
  "#7A6C8D",
  "#8A9BA8",
  "#6F8FAD",
  "#7D8899",
];

export function getChipColor(text: string) {
  const hash = [...text].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return chipColors[hash % chipColors.length];
}