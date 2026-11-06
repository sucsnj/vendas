"use client";

import { useEffect, useState } from "react";
import { sanitizeExpression, evaluateExpression } from "@/lib/calculator";

const KEYPAD_KEY = "calcKeypadOpen";

type Props = {
  value: string;
  onChange: (expr: string) => void;
};

const buttons = [
  "7", "8", "9", "/",
  "4", "5", "6", "*",
  "1", "2", "3", "-",
  "0", ".", "C", "+",
];

export function CalculatorInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(KEYPAD_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(KEYPAD_KEY, String(open));
  }, [open]);

  const preview = evaluateExpression(value);

  function handleKey(k: string) {
    if (k === "C") {
      onChange("");
      return;
    }
    if (k === "⌫") {
      onChange(sanitizeExpression(value.slice(0, -1)));
      return;
    }
    if (k === ".") {
      onChange(sanitizeExpression(value + "."));
      return;
    }
    if (["+", "-", "*", "/"].includes(k)) {
      onChange(sanitizeExpression(value + k));
      return;
    }
    onChange(sanitizeExpression(value + k));
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          inputMode="none"
          value={value}
          onChange={(e) => onChange(sanitizeExpression(e.target.value))}
          placeholder="0"
          className="w-full rounded-2xl border-2 border-blue-500 bg-white px-4 py-4 text-3xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute right-2 top-2 rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
          aria-label="toggle keypad"
        >
          ⌨
        </button>
      </div>
      <div className="text-right text-lg font-semibold text-gray-600">
        {preview === null ? "" : `= ${preview}`}
      </div>
      {open && (
        <div className="grid grid-cols-4 gap-2 rounded-2xl bg-gray-100 p-3">
          {buttons.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => handleKey(b)}
              className="rounded-xl bg-white py-3 text-xl font-bold shadow-sm active:bg-blue-200"
            >
              {b}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKey("⌫")}
            className="col-span-2 rounded-xl bg-white py-3 text-xl font-bold shadow-sm active:bg-blue-200"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="col-span-2 rounded-xl bg-gray-200 py-3 text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
