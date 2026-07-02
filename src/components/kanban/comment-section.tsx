'use client';

import { useState, useEffect } from 'react';
import { Send, User, Pencil, Trash2, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import * as api from '@/lib/api/kanban-board';
import type { ComentarioTarea } from '@/types';

interface Props {
  tareaId: string;
}

export function CommentSection({ tareaId }: Props) {
  const [comentarios, setComentarios] = useState<ComentarioTarea[]>([]);
  const [nuevo, setNuevo] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetch = async () => {
    try {
      const data = await api.getComentariosByTarea(tareaId);
      setComentarios(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [tareaId]);

  const handleSend = async () => {
    if (!nuevo.trim()) return;
    setSending(true);
    try {
      await api.createComentario({ amonet_tarea_sprint_id: tareaId, comentario: nuevo.trim() });
      setNuevo('');
      fetch();
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editText.trim()) return;
    try {
      const { patch } = await import('@/lib/api/client');
      await patch(`/comentarios-tarea/${id}`, { comentario: editText.trim() });
      setEditingId(null);
      fetch();
      toast({ title: 'Comentario actualizado', variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
      const { del } = await import('@/lib/api/client');
      await del(`/comentarios-tarea/${id}`);
      fetch();
      toast({ title: 'Comentario eliminado', variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  const canModify = (c: ComentarioTarea) => {
    return c.usuario_alta.id === user?.id || user?.rol === 'ADMIN';
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-lila-900">Comentarios</h4>

      <div className="space-y-3 max-h-72 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-gris-tecnico">Cargando...</p>
        ) : comentarios.length === 0 ? (
          <p className="text-xs text-gris-tecnico">Sin comentarios</p>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className="rounded-lg bg-white p-3 border border-border-tabla group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-gris-tecnico" />
                  <span className="text-xs font-medium text-lila-900">{c.usuario_alta.nombre}</span>
                  <span className="text-[10px] text-gris-tecnico">
                    {new Date(c.fecha_alta).toLocaleDateString('es-ES', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                {canModify(c) && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId !== c.id ? (
                      <>
                        <button
                          onClick={() => { setEditingId(c.id); setEditText(c.comentario); }}
                          className="rounded p-1 text-gris-tecnico hover:bg-lila-50 hover:text-violet-lab transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="rounded p-1 text-gris-tecnico hover:bg-rose-50 hover:text-coral-alerta transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : null}
                  </div>
                )}
              </div>

              {editingId === c.id ? (
                <div className="flex gap-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleEdit(c.id)}
                  />
                  <Button size="icon" variant="secondary" onClick={() => handleEdit(c.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-lila-800 whitespace-pre-wrap">{c.comentario}</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Escribí un comentario..."
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <Button size="icon" onClick={handleSend} disabled={sending || !nuevo.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
