'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User as UserIcon, Trash2, Save, Kanban, X, Tag as TagIcon, Flag, MessageSquare, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserSearchSelect } from '@/components/ui/user-search-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { CommentSection } from '@/components/kanban/comment-section';
import * as api from '@/lib/api/kanban-board';
import * as tagsApi from '@/lib/api/tags-kanban';
import * as prioridadesApi from '@/lib/api/prioridades-kanban';
import type { TareaSprintItem, SprintItem, ColumnaKanban, TagKanban, PrioridadKanban } from '@/types';

function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

function getAvatarColor(id: string): string {
  const colors = ['#7C4DCC', '#EC407A', '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26A69A', '#EF5350', '#5C6BC0', '#78909C'];
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function TareaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [tarea, setTarea] = useState<TareaSprintItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [asignadoId, setAsignadoId] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [columnaId, setColumnaId] = useState('');
  const [sprints, setSprints] = useState<SprintItem[]>([]);
  const [columnas, setColumnas] = useState<ColumnaKanban[]>([]);
  const [saving, setSaving] = useState(false);
  const [tagsDisponibles, setTagsDisponibles] = useState<TagKanban[]>([]);
  const [prioridades, setPrioridades] = useState<PrioridadKanban[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [prioridadId, setPrioridadId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [data, sprintsData, columnasData] = await Promise.all([
          api.getTareaById(params.id as string),
          api.getSprints(1, 100),
          api.getColumnasKanban(),
        ]);
        setTarea(data);
        setTitulo(data.titulo);
        setDescripcion(data.descripcion);
        setAsignadoId(data.asignado?.id || '');
        setFechaVencimiento(data.fecha_vencimiento?.split('T')[0] || '');
        setSprintId(data.amonet_sprint_id);
        setColumnaId(data.amonet_columna_kanban_id);
        setSelectedTags(data.tags.map(t => t.id));
        setPrioridadId(data.prioridad?.id || '');
        setSprints(sprintsData.items);
        setColumnas(columnasData);
        const [tagsData, prioridadesData] = await Promise.all([
          tagsApi.getAllTagsKanban(1, 99).catch(() => ({ items: [] as TagKanban[] })),
          prioridadesApi.getAllPrioridadesKanban(1, 99).catch(() => ({ items: [] as PrioridadKanban[] })),
        ]);
        setTagsDisponibles(tagsData.items);
        setPrioridades(prioridadesData.items);
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
        router.push('/kanban/tareas');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, toast]);

  const handleSave = async () => {
    if (!tarea) return;
    setSaving(true);
    try {
      await api.updateTarea(tarea.id, {
        titulo: titulo.trim(),
        descripcion,
        asignado: asignadoId || tarea.asignado?.id,
        fecha_vencimiento: fechaVencimiento ? fechaVencimiento + 'T00:00:00' : null,
        amonet_sprint_id: sprintId,
        amonet_columna_kanban_id: columnaId,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        amonet_prioridad_kanban_id: prioridadId || null,
      });
      const updated = await api.getTareaById(tarea.id);
      setTarea(updated);
      setSelectedTags(updated.tags.map(t => t.id));
      setPrioridadId(updated.prioridad?.id || '');
      toast({ title: 'Tarea actualizada', variant: 'success' });
      setEditando(false);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tarea) return;
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await api.deleteTarea(tarea.id);
      toast({ title: 'Tarea eliminada', variant: 'success' });
      router.push('/kanban/tareas');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-lab/20 border-t-violet-lab" />
        <p className="text-sm text-gris-tecnico animate-pulse">Cargando tarea...</p>
      </div>
    );
  }

  if (!tarea) return null;

  const vencida = tarea.fecha_vencimiento && new Date(tarea.fecha_vencimiento).toDateString() < new Date().toDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavanja-soft/50 to-white">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-gris-tecnico hover:text-violet-lab transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="rounded-2xl border border-border-tabla bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-tabla bg-lavanda-soft/30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditando(!editando)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-semibold transition-all
                  ${editando
                    ? 'bg-violet-lab text-white'
                    : 'bg-white border border-border-tabla text-lila-700 hover:bg-lila-50'
                  }
                `}
              >
                {editando ? 'Cancelar' : 'Editar tarea'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {!editando && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-xl text-coral-alerta hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {editando ? (
              <div className="space-y-5">
                <div>
                  <Input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="text-lg font-semibold border-0 border-b-2 border-border-tabla rounded-none px-0 py-2 focus:border-violet-lab focus:ring-0 shadow-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gris-tecnico uppercase tracking-wide">Descripción</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full rounded-xl border border-border-tabla px-3 py-2.5 text-sm resize-none h-24 outline-none focus:border-violet-lab focus:ring-2 focus:ring-violet-lab/10 transition-all mt-1.5"
                    placeholder="Agregar descripción..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gris-tecnico uppercase tracking-wide">Sprint</label>
                    <div className="mt-1.5">
                      <Select value={sprintId} onValueChange={setSprintId}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sprints.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.descripcion || `Sprint ${s.contador}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gris-tecnico uppercase tracking-wide">Columna</label>
                    <div className="mt-1.5">
                      <Select value={columnaId} onValueChange={setColumnaId}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {columnas.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gris-tecnico uppercase tracking-wide">Asignado</label>
                    <div className="mt-1.5">
                      <UserSearchSelect value={asignadoId} onChange={setAsignadoId} placeholder="Sin asignar" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gris-tecnico uppercase tracking-wide">Fecha vencimiento</label>
                    <div className="mt-1.5">
                      <Input
                        type="date"
                        value={fechaVencimiento}
                        onChange={(e) => setFechaVencimiento(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gris-tecnico uppercase tracking-wide">Prioridad</label>
                  <div className="mt-1.5">
                    <Select value={prioridadId} onValueChange={setPrioridadId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sin prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        {prioridades.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: `rgb(${p.color_red},${p.color_green},${p.color_blue})` }}
                              />
                              {p.nombre}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gris-tecnico uppercase tracking-wide">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tagsDisponibles.map((tag) => {
                      const selected = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => setSelectedTags((prev) => selected ? prev.filter((t) => t !== tag.id) : [...prev, tag.id])}
                          className={`
                            inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all
                            ${selected
                              ? 'text-white shadow-sm'
                              : 'bg-lila-50 text-lila-700 hover:bg-lila-100'
                            }
                          `}
                          style={selected ? { backgroundColor: `rgb(${tag.color_red},${tag.color_green},${tag.color_blue})` } : {}}
                        >
                          {selected && <Plus className="h-3 w-3" />}
                          {tag.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-violet-lab hover:bg-violet-700"
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h1 className="text-xl font-semibold text-lila-900 leading-snug">{tarea.titulo}</h1>
                </div>

                {tarea.descripcion && (
                  <div className="p-4 rounded-xl bg-lavanda-soft/50 border border-border-tabla/50">
                    <p className="text-sm text-lila-800 whitespace-pre-wrap leading-relaxed">{tarea.descripcion}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-border-tabla">
                    <Kanban className="h-4 w-4 text-gris-tecnico" />
                    <span className="text-xs font-medium text-lila-900">
                      {columnas.find(c => c.id === tarea.amonet_columna_kanban_id)?.nombre || 'Sin columna'}
                    </span>
                  </div>

                  {tarea.asignado && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-border-tabla">
                      <div
                        className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white"
                        style={{ backgroundColor: getAvatarColor(tarea.asignado.id) }}
                      >
                        {getInitials(tarea.asignado.nombre)}
                      </div>
                      <span className="text-xs font-medium text-lila-900">{tarea.asignado.nombre}</span>
                    </div>
                  )}

                  {tarea.prioridad && (
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white"
                      style={{ backgroundColor: `rgb(${tarea.prioridad.color_red},${tarea.prioridad.color_green},${tarea.prioridad.color_blue})` }}
                    >
                      <Flag className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">{tarea.prioridad.nombre}</span>
                    </div>
                  )}

                  {tarea.fecha_vencimiento && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border ${vencida ? 'border-coral-alerta bg-rose-50' : 'border-border-tabla'}`}>
                      <Calendar className={`h-4 w-4 ${vencida ? 'text-coral-alerta' : 'text-gris-tecnico'}`} />
                      <span className={`text-xs font-medium ${vencida ? 'text-coral-alerta' : 'text-lila-900'}`}>
                        {vencida ? 'Venció ' : ''}{new Date(tarea.fecha_vencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                {tarea.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TagIcon className="h-3.5 w-3.5 text-gris-tecnico" />
                      <span className="text-xs font-medium text-gris-tecnico">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tarea.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-white"
                          style={{
                            backgroundColor: `rgb(${tag.color_red},${tag.color_green},${tag.color_blue})`,
                          }}
                        >
                          {tag.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border-tabla bg-lavanda-soft/20">
            <CommentSection tareaId={tarea.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
