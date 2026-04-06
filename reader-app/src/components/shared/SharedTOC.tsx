"use client";

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export function SharedTOC({ entries }: { entries: TocEntry[] }) {
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="space-y-0.5">
      {entries.map((entry) => (
        <button
          key={entry.id}
          onClick={() => handleClick(entry.id)}
          className="block w-full text-left truncate rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          style={{ paddingLeft: `${(entry.level - 1) * 12 + 8}px` }}
        >
          {entry.text}
        </button>
      ))}
    </nav>
  );
}
