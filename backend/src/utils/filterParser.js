export function parseFilter(filter) {
  if (!filter) return {};
  if (typeof filter === "object") return filter;
  try {
    return JSON.parse(filter);
  } catch {
    return {};
  }
}

export default parseFilter;
