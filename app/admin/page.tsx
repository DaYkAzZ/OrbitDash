'use client';

/**
 * Page Admin – permet à l'administrateur de :
 *  - Voir tous les widgets
 *  - Modifier les données d'un widget (question du sondage, etc.)
 *  - Supprimer un widget
 *  - Ajouter un widget (Clock ou Poll de démo)
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWidgetStore, useAuth } from '../store';
import { Button, Input, Card } from '../components/ui';
import type { Widget } from '../types';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const { widgets, loadWidgets, editWidget, removeWidget, addWidget, isLoading } =
    useWidgetStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  // Garde admin
  if (!user || !isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-900">
        <p className="text-zinc-400">Accès réservé aux administrateurs.</p>
        <Link href="/">
          <Button variant="ghost">← Retour au dashboard</Button>
        </Link>
      </div>
    );
  }

  const startEdit = (widget: Widget) => {
    setEditingId(widget.id);
    setEditTitle(widget.title);
  };

  const saveEdit = async (id: string) => {
    await editWidget(id, { title: editTitle });
    setEditingId(null);
  };

  const handleAddClock = async () => {
    await addWidget({
      type: 'clock',
      title: 'Horloge',
      position: widgets.length,
      focusable: true,
      fullscreenable: true,
      data: { timezone: 'Europe/Paris', showSeconds: true, format24h: true },
    });
  };

  const handleAddPoll = async () => {
    await addWidget({
      type: 'poll',
      title: 'Sondage du jour',
      position: widgets.length,
      focusable: true,
      fullscreenable: true,
      data: {
        question: 'Nouvelle question ?',
        options: [
          { id: '1', label: 'Option A', votes: 0 },
          { id: '2', label: 'Option B', votes: 0 },
        ],
        allowMultiple: false,
      },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-6">
        <h1 className="text-lg font-bold">⚙ Administration</h1>
        <Link href="/">
          <Button variant="ghost" size="sm">← Dashboard</Button>
        </Link>
      </header>

      <div className="mx-auto max-w-4xl p-6 flex flex-col gap-6">
        {/* Actions rapides */}
        <Card className="flex flex-col gap-4 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Ajouter un widget
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAddClock} variant="secondary" size="sm">
              + Horloge
            </Button>
            <Button onClick={handleAddPoll} variant="secondary" size="sm">
              + Sondage
            </Button>
          </div>
        </Card>

        {/* Liste des widgets */}
        <Card className="flex flex-col gap-1 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Widgets ({widgets.length})
          </h2>

          {isLoading && (
            <p className="text-sm text-zinc-500 animate-pulse">Chargement…</p>
          )}

          {!isLoading && widgets.length === 0 && (
            <p className="text-sm text-zinc-500">Aucun widget pour l'instant.</p>
          )}

          <div className="flex flex-col divide-y divide-zinc-700/50">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between gap-4 py-3">
                {editingId === widget.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={() => saveEdit(widget.id)}>✓</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>✕</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{widget.title}</span>
                      <span className="text-xs text-zinc-500">
                        {widget.type} · pos {widget.position}
                        {widget.focusable && ' · focusable'}
                        {widget.fullscreenable && ' · fullscreen'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(widget)}>
                        ✏
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeWidget(widget.id)}
                      >
                        🗑
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
