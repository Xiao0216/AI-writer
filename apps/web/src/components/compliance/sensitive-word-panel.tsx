import type { ScanFinding } from "@/lib/types";

export function SensitiveWordPanel({ findings }: { findings: ScanFinding[] }) {
  return (
    <section className="rounded-[2rem] border border-rose-200 bg-rose-50/90 p-5">
      <h3 className="font-serif text-xl font-semibold text-rose-950">敏感词扫描</h3>
      {findings.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {findings.map((finding, index) => (
            <span
              key={`${finding.word}-${index}`}
              className="rounded-full bg-white px-3 py-2 text-sm text-rose-700"
            >
              {finding.word} → {finding.suggestion}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-rose-700">当前内容未检测到敏感词。</p>
      )}
    </section>
  );
}
