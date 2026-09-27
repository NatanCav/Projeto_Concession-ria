import { useState } from "react";
import type { DailyCount } from "@/types/dashboard";
import { cn } from "@/utils/cn";

function formatDay(isoDate: string, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" }) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", options);
}

export function VisitsChart({ data }: { data: DailyCount[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const max = Math.max(...data.map((day) => day.count), 0);
  const labelIndexes = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  if (max === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-ink-200 text-center text-sm text-ink-500">
        Nenhuma visita registrada nos últimos 30 dias.
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <span className="absolute left-0 top-0 text-[11px] leading-none text-ink-400" aria-hidden>
          {max}
        </span>
        <div
          className="pointer-events-none absolute inset-x-0 top-4 border-t border-dashed border-ink-100"
          aria-hidden
        />
        <div
          className="flex h-40 items-end gap-[2px] border-b border-ink-200 pt-4"
          onMouseLeave={() => setActiveIndex(null)}
          aria-hidden
        >
          {data.map((day, index) => {
            const heightPct = (day.count / max) * 100;
            const isActive = activeIndex === index;
            return (
              <div
                key={day.date}
                className="relative flex h-full flex-1 items-end"
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div
                  className={cn(
                    "w-full rounded-t-[4px] transition-colors",
                    day.count === 0 ? "bg-ink-100" : isActive ? "bg-brand-600" : "bg-brand-500",
                  )}
                  style={{
                    height: day.count === 0 ? "2px" : `${Math.max(heightPct, 2)}%`,
                  }}
                />
                {isActive && (
                  <div
                    className={cn(
                      "pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-ink-950 px-2.5 py-1.5 text-xs text-white shadow-popover",
                      index < 4 ? "left-0" : index > data.length - 5 ? "right-0" : "left-1/2 -translate-x-1/2",
                    )}
                  >
                    <p className="text-ink-300">
                      {formatDay(day.date, {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </p>
                    <p className="font-semibold">
                      {day.count} {day.count === 1 ? "visita" : "visitas"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex text-[11px] text-ink-400" aria-hidden>
        {data.map((day, index) => (
          <span
            key={day.date}
            className={cn(
              "flex-1",
              index === 0 ? "text-left" : index === data.length - 1 ? "text-right" : "text-center",
            )}
          >
            {labelIndexes.has(index) ? formatDay(day.date) : ""}
          </span>
        ))}
      </div>

      <div className="sr-only">
        <table>
          <caption>Visitas por dia nos últimos 30 dias</caption>
          <thead>
            <tr>
              <th scope="col">Dia</th>
              <th scope="col">Visitas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day) => (
              <tr key={day.date}>
                <td>{formatDay(day.date)}</td>
                <td>{day.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
