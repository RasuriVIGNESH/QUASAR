export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function unwrapList(response) {
  const body = response?.data ?? response;
  if (Array.isArray(body)) return body;
  return body?.content || [];
}
