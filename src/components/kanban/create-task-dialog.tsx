'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Tag, Flag, User, Calendar, AlignLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UserSearchSelect } from '@/components/ui/user-search-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import * as api from '@/lib/api/kanban-board';
import * as tagsApi from '@/lib/api/tags-kanban';
import * as prioridadesApi from '@/lib/api/prioridades-kanban';
import type { TagKanban, PrioridadKanban } from '@/types';

interface Props {
  columnaId: string;
  sprintId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateTaskDialog({ columnaId, sprintId, onClose, onCreated }: Props) {
  const { toast } = useToast();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [asignadoId, setAsignadoId] = useState('');
  const [asignadoNombre, setAsignadoNombre] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [prioridadId, setPrioridadId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tagsDisponibles, setTagsDisponibles] = useState<TagKanban[]>([]);
  const [prioridades, setPrioridades] = useState<PrioridadKanban[]>([]);

  useEffect(() => {
    Promise.all([
      tagsApi.getAllTagsKanban(1, 99).then((r) => setTagsDisponibles(r.items)),
      prioridadesApi.getAllPrioridadesKanban(1, 99).then((r) => setPrioridades(r.items)),
    ]).catch(() => {});
  }, []);

  const selectedPrioridad = prioridades.find((p) => p.id === prioridadId);

  const handleSubmit = async () => {
    if (!titulo.trim()) return;
    setSubmitting(true);
    try {
      await api.createTarea({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        asignado: asignadoId,
        fecha_vencimiento: fechaVencimiento ? `${fechaVencimiento}T00:00:00` : undefined,
        tags: tags.length > 0 ? tags : undefined,
        amonet_prioridad_kanban_id: prioridadId || null,
        amonet_sprint_id: sprintId,
        amonet_columna_kanban_id: columnaId,
      });
      toast({ title: 'Tarea creada', variant: 'success' });
      onCreated();
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl border-border-tabla shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="relative bg-gradient-to-r from-violet-lab/5 via-lavanda-soft/30 to-white px-6 pt-6 pb-4 border-b border-border-tabla">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-lab/10">
                <Sparkles className="h-5 w-5 text-violet-lab" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-lila-900">Nueva tarea</h2>
                <p className="text-xs text-gris-tecnico mt-0.5">Completá los detalles para crear la tarea</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gris-tecnico/60 hover:text-lila-900 hover:bg-white/60 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-tecnico/40 pointer-events-none">
              <Sparkles className="h-4 w-4" />
            </div>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="¿Cuál es el título de la tarea?"
              className="w-full pl-10 pr-4 py-3 text-base font-medium text-lila-900 placeholder:text-gris-tecnico/40 bg-lavanda-soft/20 border-2 border-transparent rounded-xl focus:border-violet-lab focus:bg-white focus:ring-0 outline-none transition-all"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gris-tecnico/30">
              {titulo.length}/100
            </div>
          </div>

          <div className="rounded-xl border border-border-tabla/60 bg-white overflow-hidden focus-within:border-violet-lab/40 focus-within:ring-2 focus-within:ring-violet-lab/10 transition-all">
            <div className="flex items-center gap-2 px-3 pt-3 pb-1">
              <AlignLeft className="h-3.5 w-3.5 text-gris-tecnico/60" />
              <span className="text-[11px] font-medium text-gris-tecnico/60 uppercase tracking-wider">Descripción</span>
            </div>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 pb-3 text-sm resize-none h-20 outline-none bg-transparent placeholder:text-gris-tecnico/30"
              placeholder="Agregar una descripción (opcional)..."
            />
          </div>

          <div className="rounded-xl bg-lavanda-soft/20 border border-border-tabla/40 p-4 space-y-4">
            <div className="text-[11px] font-semibold text-gris-tecnico uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-3 rounded-full bg-violet-lab/40" />
              Detalles
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-gris-tecnico">
                  <User className="h-3 w-3" />
                  Asignado
                </label>
                <UserSearchSelect value={asignadoId} onChange={(id) => { setAsignadoId(id); }} placeholder="Sin asignar" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-gris-tecnico">
                  <Calendar className="h-3 w-3" />
                  Vencimiento
                </label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="w-full rounded-lg border border-border-tabla bg-white px-3 py-2 text-sm outline-none focus:border-violet-lab focus:ring-2 focus:ring-violet-lab/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-gris-tecnico">
                <Flag className="h-3 w-3" />
                Prioridad
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPrioridadId('')}
                  className={`
                    rounded-lg border px-3 py-2 text-xs font-medium transition-all
                    ${!prioridadId
                      ? 'border-violet-lab bg-violet-lab/5 text-violet-lab'
                      : 'border-border-tabla text-gris-tecnico hover:border-gris-tecnico/40'
                    }
                  `}
                >
                  Sin prioridad
                </button>
                {prioridades.slice(0, 2).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPrioridadId(p.id)}
                    className={`
                      rounded-lg border px-3 py-2 text-xs font-medium transition-all flex items-center justify-center gap-1.5
                      ${prioridadId === p.id
                        ? 'border-transparent text-white shadow-sm'
                        : 'border-border-tabla hover:border-gris-tecnico/40'
                      }
                    `}
                    style={prioridadId === p.id ? { backgroundColor: `rgb(${p.color_red},${p.color_green},${p.color_blue})` } : {}}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: `rgb(${p.color_red},${p.color_green},${p.color_blue})` }}
                    />
                    {p.nombre}
                  </button>
                ))}
                {prioridades.length > 2 && (
                  <Select value={prioridadId} onValueChange={setPrioridadId}>
                    <SelectTrigger className="rounded-lg border-border-tabla text-xs h-auto py-2">
                      <SelectValue placeholder="Más..." />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.slice(2).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `rgb(${p.color_red},${p.color_green},${p.color_blue})` }} />
                            {p.nombre}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border-tabla/40 p-4 space-y-3">
            <div className="text-[11px] font-semibold text-gris-tecnico uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-3 w-3" />
              Tags
              {tags.length > 0 && (
                <span className="ml-auto text-[10px] font-normal text-gris-tecnico/60">{tags.length} seleccionados</span>
              )}
            </div>
            {tagsDisponibles.length === 0 ? (
              <p className="text-xs text-gris-tecnico/50 text-center py-2">No hay tags disponibles</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tagsDisponibles.map((tag) => {
                  const selected = tags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => setTags((prev) => selected ? prev.filter((t) => t !== tag.id) : [...prev, tag.id])}
                      className={`
                        inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200
                        ${selected
                          ? 'text-white shadow-sm scale-105'
                          : 'bg-lila-50 text-lila-700 hover:bg-lila-100 hover:scale-105'
                        }
                      `}
                      style={selected ? { backgroundColor: `rgb(${tag.color_red},${tag.color_green},${tag.color_blue})` } : {}}
                    >
                      {selected ? (
                        <Plus className="h-3 w-3 rotate-45 transition-transform" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      {tag.nombre}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-tabla bg-gradient-to-r from-white via-lavanda-soft/10 to-lavanda-soft/20">
          <Button variant="secondary" onClick={onClose} className="rounded-xl px-5">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !titulo.trim()}
            className="rounded-xl bg-violet-lab hover:bg-violet-700 px-6 shadow-lg shadow-violet-lab/20 disabled:shadow-none"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Crear tarea
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
