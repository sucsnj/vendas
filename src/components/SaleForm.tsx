"use client";

import { useState } from "react";
import { CalculatorInput } from "./CalculatorInput";
import { toDayReference, nowUtcIso } from "@/lib/timezone";
import { evaluateExpression } from "@/lib/calculator";
import { insertSale, updateSale } from "@/lib/db/salesRepo";
import type { Sale } from "@/lib/db/schema";

type Props = {
  editing?: Sale | null;
  onSaved: () => void;
  onCancelEdit?: () => void;
};

export function SaleForm({ editing, onSaved, onCancelEdit }: Props) {
  const [expression, setExpression] = useState(editing?.rawExpression ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [dayReference, setDayReference] = useState(editing?.dayReference ?? toDayReference());
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const amount = evaluateExpression(expression);
    if (amount === null) {
      setError("Expressão inválida");
      return;
    }
    const now = nowUtcIso();
    try {
      if (editing) {
        await updateSale(editing.id, {
          amount,
          rawExpression: expression,
          note: note || null,
          dayReference,
          updatedAt: now,
        });
      } else {
        await insertSale({
          id: crypto.randomUUID(),
          amount,
          rawExpression: expression,
          note: note || null,
          createdAt: now,
          updatedAt: now,
          dayReference,
        });
      }
      if (!editing) {
        setExpression("");
        setNote("");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
      <CalculatorInput value={expression} onChange={setExpression} onSubmit={submit} />
      <div>
        <label className="mb-1 block text-sm font-medium text-blue-200/70">Observação</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-blue-900/40 bg-blue-950/40 px-3 py-2 text-base text-white placeholder-blue-300/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-blue-200/70">Data</label>
        <input
          type="date"
          value={dayReference}
          onChange={(e) => setDayReference(e.target.value)}
          className="w-full rounded-xl border border-blue-900/40 bg-blue-950/40 px-3 py-2 text-base text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-blue-500 py-3.5 text-base font-extrabold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-300"
        >
          {editing ? "Salvar" : "Adicionar"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl bg-blue-900/40 px-4 py-3.5 text-base font-medium text-blue-200"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
