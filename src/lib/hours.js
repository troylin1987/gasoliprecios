const DAY_INDEX = {
  L: 1,
  M: 2,
  X: 3,
  J: 4,
  V: 5,
  S: 6,
  D: 0,
};

const DAY_ORDER = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export function isOpenNow(schedule, date = new Date()) {
  if (!schedule) return null;
  const normalized = schedule.toUpperCase().replace(/\s+/g, ' ').trim();
  if (normalized.includes('24H')) return true;
  if (normalized.includes('CERRADO')) return false;

  const currentDay = date.getDay();
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const segments = normalized.split(';').map((segment) => segment.trim());

  for (const segment of segments) {
    const separator = segment.indexOf(':');
    if (separator === -1) continue;
    const daysPart = segment.slice(0, separator).trim();
    const hoursPart = segment.slice(separator + 1).trim();
    if (!daysPart || !hoursPart) continue;
    if (!matchesDay(daysPart, currentDay)) continue;

    const ranges = hoursPart.match(/\d{1,2}:\d{2}-\d{1,2}:\d{2}/g) || [];
    for (const range of ranges) {
      const [start, end] = range.split('-').map(toMinutes);
      if (start === null || end === null) continue;
      if (start <= end && currentMinutes >= start && currentMinutes <= end) return true;
      if (start > end && (currentMinutes >= start || currentMinutes <= end)) return true;
    }
  }

  return false;
}

function matchesDay(daysPart, currentDay) {
  const compact = daysPart.replace(/\s/g, '');
  const tokens = compact.split(',');
  return tokens.some((token) => {
    if (DAY_INDEX[token] === currentDay) return true;
    if (!token.includes('-')) return false;
    const [start, end] = token.split('-');
    const startIndex = DAY_ORDER.indexOf(start);
    const endIndex = DAY_ORDER.indexOf(end);
    const currentTokenIndex = DAY_ORDER.indexOf(indexToToken(currentDay));
    if (startIndex === -1 || endIndex === -1) return false;
    if (startIndex <= endIndex) return currentTokenIndex >= startIndex && currentTokenIndex <= endIndex;
    return currentTokenIndex >= startIndex || currentTokenIndex <= endIndex;
  });
}

function indexToToken(index) {
  return DAY_ORDER[index];
}

function toMinutes(value) {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}
