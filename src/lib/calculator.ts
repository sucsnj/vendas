const ALLOWED = /[^0-9+\-*/.\s]/g;

export function sanitizeExpression(input: string): string {
  let expr = input.replace(ALLOWED, "");
  expr = expr.replace(/[+\-*/]{2,}/g, (m) => m[m.length - 1]);
  return expr;
}

export function evaluateExpression(input: string): number | null {
  let s = input.replace(/\s+/g, "");
  s = s.replace(/[+\-*/]+$/, "");
  if (!s) return null;

  let i = 0;
  const parseExpression = (): number => {
    let value = parseTerm();
    while (i < s.length && (s[i] === "+" || s[i] === "-")) {
      const op = s[i++];
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  };
  const parseTerm = (): number => {
    let value = parseFactor();
    while (i < s.length && (s[i] === "*" || s[i] === "/")) {
      const op = s[i++];
      const rhs = parseFactor();
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  };
  const parseFactor = (): number => {
    if (s[i] === "-") {
      i++;
      return -parseFactor();
    }
    if (s[i] === "+") {
      i++;
      return parseFactor();
    }
    const start = i;
    while (i < s.length && /[0-9.]/.test(s[i])) i++;
    const num = parseFloat(s.slice(start, i));
    if (isNaN(num)) throw new Error("invalid");
    return num;
  };

  try {
    const result = parseExpression();
    if (i !== s.length) return null;
    if (!isFinite(result)) return null;
    return Math.round(result * 1e10) / 1e10;
  } catch {
    return null;
  }
}
