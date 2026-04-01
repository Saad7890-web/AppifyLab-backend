export function encodeFeedCursor({ createdAt, id }) {
  const raw = JSON.stringify({ createdAt, id });
  return Buffer.from(raw).toString('base64url');
}

export function decodeFeedCursor(cursor) {
  if (!cursor) return null;

  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw);

    if (!parsed?.createdAt || !parsed?.id) {
      return null;
    }

    return {
      createdAt: new Date(parsed.createdAt),
      id: parsed.id
    };
  } catch {
    return null;
  }
}