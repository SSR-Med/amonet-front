'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Star, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { EntityTable } from '@/components/tables';
import { ConfirmDeleteModal } from '@/components/modals';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import * as api from '@/lib/api/kanban-board';
import type { SprintItem } from '@/types';

export default function SprintsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<SprintItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SprintItem | null>(null);

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.getSprints(p, pageSize);
      setItems(res.items);
      setTotalItems(res.total_items);
      setPage(res.current_page);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [pageSize, toast]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleNuevoSprint = async () => {
    try {
      await api.createSprint();
      toast({ title: 'Sprint creado', variant: 'success' });
      fetch();
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  const handleSetPrincipal = async (sprint: SprintItem) => {
    try {
      await api.updateSprint(sprint.id, { principal: true });
      toast({ title: 'Sprint actualizado', description: `Sprint #${sprint.contador} ahora es el principal`, variant: 'success' });
      fetch();
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  const handleDelete = useCallback((sprint: SprintItem) => {
    setItemToDelete(sprint);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteSprint(itemToDelete.id);
      toast({ title: 'Sprint eliminado', description: 'El sprint se ha desactivado correctamente', variant: 'success' });
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetch(page);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, fetch, page, toast]);

  const columns = [
    {
      key: 'contador',
      header: '#',
      render: (s: SprintItem) => <span className="font-medium">#{s.contador}</span>,
    },
    {
      key: 'fecha_inicio',
      header: 'Inicio',
      render: (s: SprintItem) => new Date(s.fecha_inicio).toLocaleDateString('es-ES'),
    },
    {
      key: 'fecha_fin',
      header: 'Fin',
      render: (s: SprintItem) => s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString('es-ES') : '—',
    },
    {
      key: 'principal',
      header: 'Principal',
      render: (s: SprintItem) =>
        s.principal
          ? <span className="text-xs font-medium text-green-600 bg-green-50 rounded-full px-2 py-0.5">Activo</span>
          : <span className="text-xs text-gris-tecnico">—</span>,
    },
    {
      key: 'acciones',
      header: '',
      render: (s: SprintItem) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => router.push(`/kanban/board/${s.id}`)}>
            <Eye className="h-4 w-4 mr-1" /> Ver
          </Button>
          {!s.principal && (
            <Button size="sm" variant="secondary" onClick={() => handleSetPrincipal(s)} title="Establecer como principal">
              <Star className="h-4 w-4 text-amber-500" />
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => handleDelete(s)} className="text-coral-alerta">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Sprints"
        description="Gestioná los sprints del kanban"
      />
      <div className="px-6 pb-4">
        <Button onClick={handleNuevoSprint}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo sprint
        </Button>
      </div>
      <div className="px-6">
        <EntityTable
          data={items}
          columns={columns}
          hideActions
          pagination={{
            currentPage: page,
            totalItems,
            pageSize,
            onPageChange: fetch,
          }}
        />
      </div>
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="¿Desactivar sprint?"
        itemName={itemToDelete ? `Sprint #${itemToDelete.contador}` : ''}
        onConfirm={confirmDelete}
      />
    </>
  );
}
