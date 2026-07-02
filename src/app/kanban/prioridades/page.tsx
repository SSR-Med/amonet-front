'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usePrioridadKanbanStore } from '@/stores/prioridad-kanban-store';
import { PageHeader } from '@/components/layout';
import { EntityTable } from '@/components/tables';
import { ConfirmDeleteModal } from '@/components/modals';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { PrioridadKanban } from '@/types';

export default function PrioridadesKanbanPage() {
  const { isAdmin } = useAuth();
  const { items, totalItems, currentPage, pageSize, loading, getAll, delete: deletePrioridad } = usePrioridadKanbanStore();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PrioridadKanban | null>(null);

  const fetch = useCallback(
    (page = 1) => getAll(page, pageSize),
    [getAll, pageSize],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    getAll(1, newPageSize);
  }, [getAll]);

  const handleDelete = useCallback((prioridad: PrioridadKanban) => {
    setItemToDelete(prioridad);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deletePrioridad(itemToDelete.id);
      toast({ title: 'Prioridad eliminada', description: 'La prioridad se ha eliminado correctamente', variant: 'success' });
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetch(currentPage);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al eliminar'), variant: 'error' });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, deletePrioridad, toast, fetch, currentPage]);

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (p: PrioridadKanban) => (
        <span className="font-medium text-lila-900">{p.nombre}</span>
      ),
    },
    {
      key: 'color',
      header: 'Color',
      render: (p: PrioridadKanban) => (
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full border border-border-tabla"
            style={{ backgroundColor: `rgb(${p.color_red}, ${p.color_green}, ${p.color_blue})` }}
          />
          <span className="text-xs text-gris-tecnico">
            rgb({p.color_red}, {p.color_green}, {p.color_blue})
          </span>
        </div>
      ),
    },
  ];

  if (!loading && items.length === 0) {
    return (
      <>
        <PageHeader title="Prioridades" description="Gestiona las prioridades para las tareas del kanban" />
        <EmptyState
          title="Aún no hay prioridades"
          description="Crea tu primera prioridad para empezar a priorizar tareas."
          href="/kanban/prioridades/new"
          hrefLabel="Crear prioridad"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Prioridades"
        description="Gestiona las prioridades para las tareas del kanban"
        createHref="/kanban/prioridades/new"
        createLabel="Crear prioridad"
      />
      <div className="px-6">
        <EntityTable
          data={items}
          columns={columns}
          editHref={(p: PrioridadKanban) => `/kanban/prioridades/${p.id}/edit`}
          onDelete={handleDelete}
          pagination={{
            currentPage,
            totalItems,
            pageSize,
            onPageChange: fetch,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </div>
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="¿Eliminar prioridad?"
        itemName={itemToDelete?.nombre || ''}
        onConfirm={confirmDelete}
      />
    </>
  );
}
