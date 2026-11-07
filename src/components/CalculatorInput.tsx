"use client";

import { useEffect, useState } from "react";
import { sanitizeExpression, evaluateExpression } from "@/lib/calculator";

const KEYPAD_KEY = "calcKeypadOpen";

type Props = {
  value: string;
  onChange: (expr: string) => void;
  onSubmit?: () => void;
};

const numberButtons = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", ","];
const operatorButtons = ["/", "*", "-", "+"];

export function CalculatorInput({ value, onChange, onSubmit }: Props) {
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
    if (k === "DEL") {
      onChange(sanitizeExpression(value.slice(0, -1)));
      return;
    }
    onChange(sanitizeExpression(value + k));
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl border-2 border-blue-500 bg-blue-950/90 px-4 py-3">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(sanitizeExpression(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit?.();
            }
          }}
          placeholder="0"
          className="w-full bg-transparent text-3xl font-extrabold text-white placeholder-blue-300/40 focus:outline-none"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-blue-200/70">Previa</span>
        <span className="text-lg font-extrabold text-blue-300">
          {preview === null ? "\u2014" : preview.toFixed(2).replace(".", ",")}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300"
      >
        {open ? "Ocultar teclado" : "Mostrar teclado"}
      </button>
      {open && (
        <div className="rounded-2xl border border-blue-900/40 bg-slate-900/60 p-3">
          <div className="mb-2 grid grid-cols-4 gap-2">
            {operatorButtons.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => handleKey(b)}
                className="rounded-xl bg-blue-500 py-3 text-xl font-bold text-white active:scale-95 active:bg-blue-600"
              >
                {b}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {numberButtons.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => handleKey(b)}
                className="rounded-xl border border-blue-700/40 bg-blue-900/40 py-3 text-lg font-bold text-white active:scale-95"
              >
                {b}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKey("C")}
              className="rounded-xl border border-blue-700/40 bg-blue-900/40 py-3 text-lg font-bold text-white active:scale-95"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKey("DEL")}
              className="rounded-xl border border-blue-700/40 bg-blue-900/40 py-3 text-lg font-bold text-white active:scale-95"
            >
              DEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
