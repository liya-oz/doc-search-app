const RATE_LIMIT = 5; // max requests
const WINDOW_MS = 60 * 1000; // 1 minute

type RateRecord = {
  count: number;
  windowStart: number;
};

const ipRequests = new Map<string, RateRecord>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);

  // First request OR window expired → start new window
  if (!record || now - record.windowStart >= WINDOW_MS) {
    ipRequests.set(ip, {
      count: 1,
      windowStart: now,
    });
    return false;
  }

  // Limit exceeded → block
  if (record.count >= RATE_LIMIT) {
    return true;
  }

  // Still within limit → allow and count
  record.count += 1;
  ipRequests.set(ip, record);

  return false;
}
