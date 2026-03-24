"use client";

const actions = [
  { label: "扩写", type: "EXPAND" },
  { label: "缩写", type: "SHORTEN" },
  { label: "改写", type: "REWRITE" },
] as const;

export function SelectionActions({
  hasSelection,
  onPick,
}: {
  hasSelection: boolean;
  onPick: (type: "EXPAND" | "SHORTEN" | "REWRITE") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.type}
          type="button"
          disabled={!hasSelection}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition enabled:hover:border-stone-900 enabled:hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPick(action.type)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
