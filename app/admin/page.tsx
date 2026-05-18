"use client";

/**
 * Admin Page - Gestion des widgets
 * Pas d'authentification requise dans cette version
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Trash2, RotateCcw, ArrowLeft } from "lucide-react";
import { useWidgetStore } from "../store";
import type { WidgetType } from "@/app/types";

const WIDGET_TYPES: { type: WidgetType; name: string; description: string }[] =
  [
    {
      type: "clock",
      name: "Horloge",
      description: "Affiche l'heure en temps réel",
    },
    {
      type: "weather",
      name: "Météo",
      description: "Conditions météorologiques",
    },
    {
      type: "stock",
      name: "Bourse",
      description: "Indices boursiers et crypto",
    },
    { type: "mood", name: "Humeur", description: "Humeur et émotions" },
    { type: "notes", name: "Notes", description: "Prise de notes rapide" },
    { type: "music", name: "Musique", description: "Lecteur de musique" },
    { type: "activity", name: "Activité", description: "Suivi des tâches" },
    {
      type: "ainews",
      name: "Actualités IA",
      description: "Dernières actualités",
    },
  ];

const POSITIONS = ["top", "left", "right", "bottom", "center"] as const;

export default function AdminPage() {
  const { widgets, removeWidget, resetWidgets } = useWidgetStore();
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<
    "left" | "right" | "top" | "bottom" | "center"
  >("left");

  const handleAddWidget = () => {
    if (selectedType) {
      // Mock implementation - would be replaced with actual store method
      console.log(`Adding ${selectedType} widget at ${selectedPosition}`);
      setSelectedType(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au dashboard
          </motion.button>
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Administration</h1>
        <p className="text-zinc-400">Gérez vos widgets et votre dashboard</p>
      </motion.div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => resetWidgets()}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser les widgets
          </motion.button>
        </motion.div>

        {/* Add widget section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-zinc-900/50 border border-zinc-700/50 rounded-lg space-y-4"
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter un widget
          </h2>

          <div className="grid grid-cols-4 gap-3">
            {WIDGET_TYPES.map((widget) => (
              <motion.button
                key={widget.type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedType(widget.type)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedType === widget.type
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-zinc-700/50 bg-zinc-800/50 hover:border-zinc-600"
                }`}
              >
                <p className="font-semibold text-white text-sm">
                  {widget.name}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {widget.description}
                </p>
              </motion.button>
            ))}
          </div>

          {selectedType && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 p-3 bg-zinc-800/50 rounded-lg items-center"
            >
              <label className="text-sm text-zinc-300">Position:</label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddWidget}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/20"
              >
                Ajouter
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Widgets list */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-bold text-white">
            Widgets actifs ({widgets.length})
          </h2>
          <div className="space-y-2">
            {widgets.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4">
                Aucun widget actuellement. Créez-en un pour commencer.
              </p>
            ) : (
              widgets.map((widget) => (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex items-center justify-between hover:border-zinc-600 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{widget.title}</p>
                    <p className="text-xs text-zinc-500">
                      ID: {widget.id} • Position: {widget.position}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeWidget(widget.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
