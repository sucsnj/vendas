const ALLOWED = /[^0-9+\-*/.,\s]/g;

export function sanitizeExpression(input: string): string {
  const cleaned = input.replace(ALLOWED, "");
  let result = "";
  let hasDecimal = false;
  let decimalCount = 0;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (/[+\-*/\s]/.test(ch)) {
      result += ch;
      hasDecimal = false;
      decimalCount = 0;
      continue;
    }
    if (ch === "." || ch === ",") {
      if (hasDecimal) continue;
      result += ch;
      hasDecimal = true;
      decimalCount = 0;
      continue;
    }
    if (hasDecimal) {
      if (decimalCount >= 2) continue;
      decimalCount++;
    }
    result += ch;
  }
  let expr = result;
  expr = expr.replace(/[+\-*/]{2,}/g, (m) => m[m.length - 1]);
  expr = expr.replace(/[.,]{2,}/g, (m) => m[m.length - 1]);
  return expr;
}

export function evaluateExpression(input: string): number | null {
  let s = input.replace(/\s+/g, "");
  s = s.replace(/,/g, ".");
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
    while (i < s.length && /[0-9.,]/.test(s[i])) i++;
    let token = s.slice(start, i).replace(/,/g, ".");
    if (token === "" || token === ".") token = token === "." ? "0." : "0";
    const num = parseFloat(token);
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
