import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [term, setTerm] = useState(value);
  const debounced = useDebounce(term, 400);

  useEffect(() => {
    setTerm(value);
  }, [value]);

  useEffect(() => {
    if (debounced !== value) {
      onChange(debounced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Buscar por marca, modelo ou versão"
        className="h-11 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}
