function appendRetinaSuffix(path: string): string {
  const queryIndex = path.indexOf("?");
  const hasQuery = queryIndex !== -1;
  const basePath = hasQuery ? path.slice(0, queryIndex) : path;
  const query = hasQuery ? path.slice(queryIndex) : "";
  const dotIndex = basePath.lastIndexOf(".");
  if (dotIndex === -1) {
    return `${basePath}@2x${query}`;
  }
  const retinaPath = `${basePath.slice(0, dotIndex)}@2x${basePath.slice(dotIndex)}`;
  return `${retinaPath}${query}`;
}

export function createItemSrcset(path: string): string {
  return `${path} 1x, ${appendRetinaSuffix(path)} 2x`;
}
