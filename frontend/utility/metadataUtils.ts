export const parseMetadata = (raw: unknown): Record<string, any> => {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") {
    return raw as Record<string, any>;
  }
  return {};
};

export const setNestedMetadata = (
  metadata: Record<string, any>,
  path: string[],
  value: any
): Record<string, any> => {
  const newMeta = { ...metadata };
  let current = newMeta;
  for (let i = 0; i < path.length - 1; i++) {
    if (!current[path[i]]) current[path[i]] = {};
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
  return newMeta;
};
