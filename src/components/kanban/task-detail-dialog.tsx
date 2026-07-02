'use client';

import { useState, useEffect } from 'react';
import { Calendar, User as UserIcon, Trash2, Save, Kanban } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { CommentSection } from './comment-section';
import * as api from '@/lib/api/kanban-board';
import type { TareaSprintItem, SprintItem, ColumnaKanban } from '@/types';

interface Props {
  tarea: TareaSprintItem;
  onClose: () => void;
  onUpdated: () => void;
}

export function TaskDetailDialog({ tarea, onClose, onUpdated }: Props) {
  const { toast } = useToast();
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(tarea.titulo);
  const [descripcion, setDescripcion] = useState(tarea.descripcion);
  const [asignadoId, setAsignadoId] = useState(tarea.asignado?.id || '');
  const [fechaVencimiento, setFechaVencimiento] = useState(tarea.fecha_vencimiento?.split('T')[0] || '');
  const [sprintId, setSprintId] = useState(tarea.amonet_sprint_id);
  const [columnaId, setColumnaId] = useState(tarea.amonet_columna_kanban_id);
  const [sprints, setSprints] = useState<SprintItem[]>([]);
  const [columnas, setColumnas] = useState<ColumnaKanban[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSprints(1, 100).then(res => setSprints(res.items)).catch(() => {});
    api.getColumnasKanban().then(setColumnas).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateTarea(tarea.id, {
        titulo: titulo.trim(),
        descripcion,
        asignado: asignadoId || tarea.asignado?.id,
        fecha_vencimiento: fechaVencimiento ? fechaVencimiento + 'T00:00:00' : null,
        amonet_sprint_id: sprintId,
        amonet_columna_kanban_id: columnaId,
        amonet_prioridad_kanban_id: tarea.prioridad?.id || null,
      });
      toast({ title: 'Tarea actualizada', variant: 'success' });
      setEditando(false);
      onUpdated();
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await api.deleteTarea(tarea.id);
      toast({ title: 'Tarea eliminada', variant: 'success' });
      onUpdated();
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{editando ? 'Editar tarea' : tarea.titulo}</DialogTitle>
            <div className="flex items-center gap-2">
              {!editando ? (
                <>
                  <Button variant="secondary" size="sm" onClick={() => setEditando(true)}>Editar</Button>
                  <Button variant="secondary" size="sm" onClick={handleDelete} className="text-coral-alerta">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {editando ? (
            <>
              <div>
                <label className="text-sm font-medium text-lila-900">Título</label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-lila-900">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full rounded-lg border border-border-tabla px-3 py-2 text-sm resize-none h-24 outline-none focus:border-violet-lab"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-lila-900">Sprint</label>
                  <Select value={sprintId} onValueChange={setSprintId}>
                    <SelectTrigger>
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
                <div>
                  <label className="text-sm font-medium text-lila-900">Columna</label>
                  <Select value={columnaId} onValueChange={setColumnaId}>
                    <SelectTrigger>
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
              <div>
                <label className="text-sm font-medium text-lila-900">Asignado</label>
                <UserSearchSelect value={asignadoId} onChange={setAsignadoId} placeholder="Sin asignar" />
              </div>
              <div>
                <label className="text-sm font-medium text-lila-900">Fecha vencimiento</label>
                <Input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-gris-tecnico mb-1">Descripción</p>
                <p className="text-sm text-lila-800 whitespace-pre-wrap">{tarea.descripcion || 'Sin descripción'}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gris-tecnico">
                  <Kanban className="h-4 w-4" />
                  {sprints.find(s => s.id === tarea.amonet_sprint_id)?.descripcion || sprints.find(s => s.id === tarea.amonet_sprint_id)?.contador ? `Sprint ${sprints.find(s => s.id === tarea.amonet_sprint_id)?.contador}` : 'Sin sprint'}
                </div>
                <div className="flex items-center gap-2 text-gris-tecnico">
                  <UserIcon className="h-4 w-4" />
                  {tarea.asignado?.nombre || 'Sin asignar'}
                </div>
                {tarea.prioridad && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: `rgb(${tarea.prioridad.color_red},${tarea.prioridad.color_green},${tarea.prioridad.color_blue})` }}
                  >
                    {tarea.prioridad.nombre}
                  </span>
                )}
                {tarea.fecha_vencimiento && (
                  <span className="flex items-center gap-1 text-gris-tecnico">
                    <Calendar className="h-4 w-4" />
                    {new Date(tarea.fecha_vencimiento).toLocaleDateString('es-ES')}
                  </span>
                )}
              </div>
              {tarea.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tarea.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: `rgb(${tag.color_red},${tag.color_green},${tag.color_blue})` }}
                    >
                      {tag.nombre}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          <hr className="border-border-tabla" />

          <CommentSection tareaId={tarea.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
