"use client";

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
      {message}
    </div>
  );
}
