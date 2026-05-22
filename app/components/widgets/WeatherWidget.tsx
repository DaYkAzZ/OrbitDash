"use client";
import type { WidgetConfig } from "@/app/types";

const WMO: Record<number, { icon: string; label: string }> = {
  0:{icon:"☀️",label:"Ensoleillé"},1:{icon:"🌤",label:"Peu nuageux"},2:{icon:"⛅",label:"Nuageux"},
  3:{icon:"☁️",label:"Couvert"},61:{icon:"🌧",label:"Pluie"},80:{icon:"🌦",label:"Averses"},95:{icon:"⛈",label:"Orage"},
};

export function WeatherWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const d = widget.data;
  const w = WMO[d.weathercode ?? 0] ?? { icon: "🌡", label: d.condition ?? "—" };

  const stats = [
    { label: "Humidité",   value: `${d.humidity ?? "--"}%`,     icon: "💧" },
    { label: "Vent",       value: `${d.windSpeed ?? "--"} km/h`, icon: "💨" },
    { label: "Pression",   value: `${d.pressure ?? "1013"} hPa`,icon: "🌡" },
    { label: "Visibilité", value: "10 km",                       icon: "👁" },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Current */}
      <div className="flex items-center gap-6">
        <span className="text-7xl">{w.icon}</span>
        <div>
          <p className="text-6xl font-bold text-[var(--text-1)]">{d.temperature ?? "--"}°C</p>
          <p className="text-lg text-[var(--text-2)] mt-1">{w.label}</p>
          <p className="text-sm text-[var(--text-3)]">{d.city ?? "Paris, France"}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="stat-card flex flex-col gap-1">
            <span className="text-lg">{s.icon}</span>
            <p className="text-sm font-semibold text-[var(--text-1)]">{s.value}</p>
            <p className="text-xs text-[var(--text-3)]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Forecast */}
      {d.forecast && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)] mb-3">Prévisions 5 jours</p>
          <div className="grid grid-cols-5 gap-2">
            {d.forecast.map((f: any, i: number) => (
              <div key={i} className="stat-card flex flex-col items-center gap-1 py-3">
                <p className="text-xs font-medium text-[var(--text-2)]">{f.day}</p>
                <span className="text-2xl">{WMO[f.code ?? 0]?.icon ?? "🌡"}</span>
                <p className="text-sm font-bold text-[var(--text-1)]">{f.high}°</p>
                <p className="text-xs text-[var(--text-3)]">{f.low}°</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
