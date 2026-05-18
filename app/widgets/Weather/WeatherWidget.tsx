"use client";

/**
 * WeatherWidget – météo en temps réel via Open-Meteo (sans clé API).
 *
 * API : https://open-meteo.com/  — 100% gratuite, sans inscription.
 * Géocodage : https://geocoding-api.open-meteo.com
 *
 * Modes :
 *  - inplace  : température + icône météo
 *  - focus    : températures horaires + prévisions 7 jours
 *  - fullscreen : prévisions complètes
 */

import { useEffect, useState, useCallback } from "react";
import type { WidgetProps, WeatherData } from "../../types";
import { Card } from "../../components/ui";

// ── Code météo → emoji + label ────────────────────────────────────────────────
const WMO: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "Ensoleillé" },
  1: { icon: "🌤", label: "Peu nuageux" },
  2: { icon: "⛅", label: "Partiellement nuageux" },
  3: { icon: "☁️", label: "Couvert" },
  45: { icon: "🌫", label: "Brouillard" },
  48: { icon: "🌫", label: "Givre" },
  51: { icon: "🌦", label: "Bruine légère" },
  53: { icon: "🌦", label: "Bruine" },
  55: { icon: "🌧", label: "Bruine forte" },
  61: { icon: "🌧", label: "Pluie légère" },
  63: { icon: "🌧", label: "Pluie" },
  65: { icon: "🌧", label: "Pluie forte" },
  71: { icon: "🌨", label: "Neige légère" },
  73: { icon: "🌨", label: "Neige" },
  75: { icon: "❄️", label: "Neige forte" },
  80: { icon: "🌦", label: "Averses légères" },
  81: { icon: "🌧", label: "Averses" },
  82: { icon: "⛈", label: "Averses fortes" },
  95: { icon: "⛈", label: "Orage" },
  99: { icon: "⛈", label: "Orage violent" },
};

function wmo(code: number) {
  return WMO[code] ?? { icon: "🌡", label: `Code ${code}` };
}

// ── Types de réponse Open-Meteo ───────────────────────────────────────────────
interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weathercode: number;
    windspeed_10m: number;
    relativehumidity_2m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    precipitation_sum: number[];
  };
}

function temp(n: number, unit: "celsius" | "fahrenheit") {
  if (unit === "fahrenheit") return `${Math.round((n * 9) / 5 + 32)}°F`;
  return `${Math.round(n)}°C`;
}

// ── Composant principal ────────────────────────────────────────────────────────

export function WeatherWidget({
  widget,
  mode,
  onFocus,
  onFullscreen,
  onClose,
}: WidgetProps) {
  const data = widget.data as WeatherData;
  const [weather, setWeather] = useState<OpenMeteoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(data.lat));
      url.searchParams.set("longitude", String(data.lon));
      url.searchParams.set(
        "current",
        [
          "temperature_2m",
          "apparent_temperature",
          "precipitation",
          "weathercode",
          "windspeed_10m",
          "relativehumidity_2m",
        ].join(","),
      );
      url.searchParams.set("hourly", "temperature_2m,weathercode");
      url.searchParams.set(
        "daily",
        [
          "temperature_2m_max",
          "temperature_2m_min",
          "weathercode",
          "precipitation_sum",
        ].join(","),
      );
      url.searchParams.set("forecast_days", "7");
      url.searchParams.set("timezone", "auto");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("API météo indisponible");
      const json: OpenMeteoResponse = await res.json();
      setWeather(json);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [data.lat, data.lon]);

  useEffect(() => {
    const run = window.setTimeout(fetchWeather, 0);
    const id = setInterval(fetchWeather, 15 * 60_000); // refresh 15 min
    return () => {
      clearInterval(id);
      window.clearTimeout(run);
    };
  }, [fetchWeather]);

  if (loading && !weather) {
    return (
      <Card className="flex h-full items-center justify-center">
        <span className="animate-pulse text-xs text-zinc-500">Météo…</span>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="flex h-full items-center justify-center p-4 text-center">
        <p className="text-xs text-red-400">{error ?? "Erreur inconnue"}</p>
      </Card>
    );
  }

  const cur = weather.current;
  const { icon, label } = wmo(cur.weathercode);

  // Prochaines 6h
  const nowHour = new Date().getHours();
  const hourly = weather.hourly.time
    .map((t, i) => ({
      time: t,
      temp: weather.hourly.temperature_2m[i],
      code: weather.hourly.weathercode[i],
    }))
    .filter((_, i) => {
      const h = new Date(weather.hourly.time[i]).getHours();
      return h >= nowHour && h <= nowHour + 6;
    })
    .slice(0, 7);

  // ── In-place ──────────────────────────────────────────────────────────────
  if (mode === "compact") {
    return (
      <Card
        hoverable={true}
        onClick={onFocus}
        className="flex h-full flex-col justify-between p-4"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          {data.city}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-4xl">{icon}</span>
          <div>
            <p className="text-3xl font-bold text-foreground">
              {temp(cur.temperature_2m, data.unit)}
            </p>
            <p className="text-xs text-zinc-500">
              Ressenti {temp(cur.apparent_temperature, data.unit)}
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-400">{label}</p>
      </Card>
    );
  }

  // ── Focus ─────────────────────────────────────────────────────────────────
  if (mode === "focus") {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{data.city}</h2>
          <div className="flex gap-2">
            {widget.fullscreenable && (
              <button
                onClick={onFullscreen}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground"
              >
                ⛶
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Actuel */}
        <div className="flex items-center gap-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 p-4">
          <span className="text-5xl">{icon}</span>
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-foreground">
              {temp(cur.temperature_2m, data.unit)}
            </p>
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="text-xs text-zinc-500">
              💧{cur.relativehumidity_2m}% · 💨{Math.round(cur.windspeed_10m)}{" "}
              km/h
            </p>
          </div>
        </div>

        {/* Prévisions horaires */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Prochaines heures
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {hourly.map((h) => (
              <div
                key={h.time}
                className="flex min-w-[56px] flex-col items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 p-2"
              >
                <p className="text-xs text-zinc-500">
                  {new Date(h.time).getHours()}h
                </p>
                <span className="text-xl">{wmo(h.code).icon}</span>
                <p className="text-xs font-semibold text-foreground">
                  {temp(h.temp, data.unit)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Prévisions 7 jours */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            7 jours
          </p>
          <div className="flex flex-col gap-1">
            {weather.daily.time.map((day, i) => (
              <div
                key={day}
                className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
              >
                <p className="w-20 text-xs text-zinc-400 capitalize">
                  {new Date(day).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <span className="text-lg">
                  {wmo(weather.daily.weathercode[i]).icon}
                </span>
                <p className="text-xs text-zinc-400">
                  {temp(weather.daily.temperature_2m_min[i], data.unit)} –{" "}
                  <span className="font-semibold text-foreground">
                    {temp(weather.daily.temperature_2m_max[i], data.unit)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{data.city}</h1>
          <p className="text-zinc-400">{label}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-7xl">{icon}</span>
          <p className="text-6xl font-bold text-white">
            {temp(cur.temperature_2m, data.unit)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Ressenti",
            value: temp(cur.apparent_temperature, data.unit),
          },
          { label: "Humidité", value: `${cur.relativehumidity_2m}%` },
          { label: "Vent", value: `${Math.round(cur.windspeed_10m)} km/h` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl bg-zinc-800/60 p-3 text-center"
          >
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          7 jours
        </p>
        <div className="grid grid-cols-7 gap-2">
          {weather.daily.time.map((day, i) => (
            <div
              key={day}
              className="flex flex-col items-center gap-1 rounded-xl bg-zinc-800/60 p-2"
            >
              <p className="text-xs text-zinc-500 capitalize">
                {new Date(day).toLocaleDateString("fr-FR", {
                  weekday: "short",
                })}
              </p>
              <span className="text-2xl">
                {wmo(weather.daily.weathercode[i]).icon}
              </span>
              <p className="text-xs font-semibold text-white">
                {temp(weather.daily.temperature_2m_max[i], data.unit)}
              </p>
              <p className="text-xs text-zinc-500">
                {temp(weather.daily.temperature_2m_min[i], data.unit)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="mx-auto text-sm text-zinc-500 hover:text-white"
      >
        Quitter le plein écran
      </button>
    </div>
  );
}
