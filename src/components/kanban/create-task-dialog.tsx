'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserSearchSelect } from '@/components/ui/user-search-select';
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

  const handleSubmit = async () => {
    if (!titulo.trim()) return;
    setSubmitting(true);
    try {
      await api.createTarea({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        asignado: asignadoId || undefined as any,
        fecha_vencimiento: fechaVencimiento ? fechaVencimiento + 'T00:00:00' : undefined,
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-lila-900">Título *</label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título de la tarea" />
          </div>
          <div>
            <label className="text-sm font-medium text-lila-900">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-lg border border-border-tabla px-3 py-2 text-sm resize-none h-20 outline-none focus:border-violet-lab"
              placeholder="Descripción opcional"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-lila-900">Asignado</label>
              <UserSearchSelect value={asignadoId} onChange={setAsignadoId} placeholder="Sin asignar" />
            </div>
            <div>
              <label className="text-sm font-medium text-lila-900">Fecha vencimiento</label>
              <Input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-lila-900">Prioridad</label>
              <select
                value={prioridadId}
                onChange={(e) => setPrioridadId(e.target.value)}
                className="w-full rounded-lg border border-border-tabla px-3 py-2 text-sm bg-white outline-none focus:border-violet-lab"
              >
                <option value="">Sin prioridad</option>
                {prioridades.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-lila-900">Tags</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {tagsDisponibles.map((tag) => {
                const selected = tags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => setTags((prev) => selected ? prev.filter((t) => t !== tag.id) : [...prev, tag.id])}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      selected ? 'text-white' : 'bg-lila-50 text-lila-700 hover:bg-lila-100'
                    }`}
                    style={selected ? { backgroundColor: `rgb(${tag.color_red},${tag.color_green},${tag.color_blue})` } : {}}
                  >
                    {tag.nombre}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting || !titulo.trim()}>
              {submitting ? 'Creando...' : 'Crear tarea'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
