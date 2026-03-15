const guestUsage = new Map();
const LIMITS = { generate: 5, enhance: 3 };

const get = (ip) => {
  const key = `guest_${ip}`;
  if (!guestUsage.has(key)) guestUsage.set(key, { generate: 0, enhance: 0 });
  return guestUsage.get(key);
};

export const checkGuestLimit = (ip, type) => {
  const usage   = get(ip);
  const limit   = LIMITS[type];
  const current = usage[type] || 0;
  return { allowed: current < limit, used: current, limit, remaining: Math.max(0, limit - current) };
};

export const incrementGuestUsage = (ip, type) => {
  const usage = get(ip);
  usage[type] = (usage[type] || 0) + 1;
};

export const getGuestStats = (ip) => {
  const usage = get(ip);
  return {
    generate: { used: usage.generate || 0, limit: LIMITS.generate, remaining: Math.max(0, LIMITS.generate - (usage.generate || 0)) },
    enhance:  { used: usage.enhance  || 0, limit: LIMITS.enhance,  remaining: Math.max(0, LIMITS.enhance  - (usage.enhance  || 0)) },
  };
};
