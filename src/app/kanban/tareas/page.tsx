'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Tag as TagIcon, Flag } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FilterContainer } from '@/components/ui/filter-container';
import { PaginationBar } from '@/components/ui/pagination-bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { useTagKanbanStore, usePrioridadKanbanStore } from '@/stores';
import * as api from '@/lib/api/kanban-board';
import type { TareaSprintItem, SprintItem } from '@/types';

export default function TareasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { getAll: getAllTags, items: tags } = useTagKanbanStore();
  const { getAll: getAllPrioridades, items: prioridades } = usePrioridadKanbanStore();

  const [items, setItems] = useState<TareaSprintItem[]>([]);
  const [sprints, setSprints] = useState<SprintItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [prioridadId, setPrioridadId] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [fechaMin, setFechaMin] = useState('');
  const [fechaMax, setFechaMax] = useState('');

  useEffect(() => {
    getAllTags(1, 100);
    getAllPrioridades(1, 100);
    api.getSprints(1, 100).then(res => setSprints(res.items)).catch(() => {});
  }, [getAllTags, getAllPrioridades]);

  const buildFilters = useCallback(() => {
    const filters: Parameters<typeof api.getAllTareas>[0] = {};
    if (titulo) filters.titulo = titulo;
    if (sprintId) filters.amonet_sprint_id = sprintId;
    if (prioridadId) filters.amonet_prioridad_kanban_id = prioridadId;
    if (tagIds.length > 0) filters.tags = tagIds;
    if (fechaMin) filters.fecha_min = fechaMin;
    if (fechaMax) filters.fecha_max = fechaMax;
    return filters;
  }, [titulo, sprintId, prioridadId, tagIds, fechaMin, fechaMax]);

  const fetch = useCallback(async (p: number, ps?: number) => {
    setLoading(true);
    try {
      const res = await api.getAllTareas({ ...buildFilters(), page: p, page_size: ps || pageSize });
      setItems(res.items);
      setTotalItems(res.total_items);
      setPage(res.current_page);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast, buildFilters, pageSize]);

  useEffect(() => {
    fetch(1);
  }, [fetch]);

  const toggleTag = (tagId: string) => {
    setTagIds(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  return (
    <>
      <PageHeader
        title="Tareas"
        description="Lista de todas las tareas"
      />

      <div className="px-6">
        <FilterContainer
          open={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
          onSearch={() => fetch(1, pageSize)}
          loading={loading}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Título</label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Buscar por título..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Sprint</label>
              <Select value={sprintId} onValueChange={(v) => setSprintId(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {sprints.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.descripcion || `Sprint ${s.contador}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Prioridad</label>
              <Select value={prioridadId} onValueChange={(v) => setPrioridadId(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {prioridades.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha desde</label>
              <Input type="date" value={fechaMin} onChange={(e) => setFechaMin(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha hasta</label>
              <Input type="date" value={fechaMax} onChange={(e) => setFechaMax(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <Badge
                    key={t.id}
                    variant={tagIds.includes(t.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: tagIds.includes(t.id)
                        ? `rgb(${t.color_red}, ${t.color_green}, ${t.color_blue})`
                        : 'transparent',
                      color: tagIds.includes(t.id) ? 'white' : `rgb(${t.color_red}, ${t.color_green}, ${t.color_blue})`,
                      borderColor: `rgb(${t.color_red}, ${t.color_green}, ${t.color_blue})`,
                    }}
                    onClick={() => toggleTag(t.id)}
                  >
                    {t.nombre}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </FilterContainer>

        {loading && <p className="py-8 text-center text-sm text-gris-tecnico">Cargando...</p>}

        {!loading && items.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gris-tecnico">No se encontraron tareas.</p>
            </CardContent>
          </Card>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3 mb-4">
            {items.map(tarea => (
              <Card key={tarea.id} className="cursor-pointer hover:border-violet-lab transition-colors">
                <CardContent className="p-4" onClick={() => router.push(`/kanban/board/${tarea.amonet_sprint_id}`)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{tarea.titulo}</p>
                        {tarea.prioridad && (
                          <Badge
                            style={{
                              backgroundColor: `rgb(${tarea.prioridad.color_red}, ${tarea.prioridad.color_green}, ${tarea.prioridad.color_blue})`,
                              color: 'white',
                            }}
                          >
                            {tarea.prioridad.nombre}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gris-tecnico">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(tarea.fecha_alta).toLocaleDateString()}
                        </span>
                        {tarea.fecha_vencimiento && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Vence: {new Date(tarea.fecha_vencimiento).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Flag className="h-3 w-3" />
                          {tarea.asignado.nombre}
                        </span>
                        {tarea.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <TagIcon className="h-3 w-3" />
                            {tarea.tags.length}
                          </span>
                        )}
                      </div>
                      {tarea.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {tarea.tags.slice(0, 5).map(tag => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              style={{
                                borderColor: `rgb(${tag.color_red}, ${tag.color_green}, ${tag.color_blue})`,
                                color: `rgb(${tag.color_red}, ${tag.color_green}, ${tag.color_blue})`,
                              }}
                            >
                              {tag.nombre}
                            </Badge>
                          ))}
                          {tarea.tags.length > 5 && (
                            <Badge variant="outline">+{tarea.tags.length - 5}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <PaginationBar
            currentPage={page}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(p) => fetch(p, pageSize)}
            onPageSizeChange={(s) => { setPageSize(s); fetch(1, s); }}
          />
        )}
      </div>
    </>
  );
}
