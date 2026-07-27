export function createSessionId(now: number = Date.now()): string {
  const timestamp = now.toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `session_${timestamp}_${random}`;
}
