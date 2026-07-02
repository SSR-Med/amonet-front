'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useTagKanbanStore } from '@/stores/tag-kanban-store';
import { PageHeader } from '@/components/layout';
import { EntityTable } from '@/components/tables';
import { ConfirmDeleteModal } from '@/components/modals';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { TagKanban } from '@/types';

export default function TagsKanbanPage() {
  const { isAdmin } = useAuth();
  const { items, totalItems, currentPage, pageSize, loading, getAll, delete: deleteTag } = useTagKanbanStore();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TagKanban | null>(null);

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

  const handleDelete = useCallback((tag: TagKanban) => {
    setItemToDelete(tag);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteTag(itemToDelete.id);
      toast({ title: 'Tag eliminado', description: 'El tag se ha eliminado correctamente', variant: 'success' });
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetch(currentPage);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al eliminar'), variant: 'error' });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, deleteTag, toast, fetch, currentPage]);

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (tag: TagKanban) => (
        <span className="font-medium text-lila-900">{tag.nombre}</span>
      ),
    },
    {
      key: 'color',
      header: 'Color',
      render: (tag: TagKanban) => (
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full border border-border-tabla"
            style={{ backgroundColor: `rgb(${tag.color_red}, ${tag.color_green}, ${tag.color_blue})` }}
          />
          <span className="text-xs text-gris-tecnico">
            rgb({tag.color_red}, {tag.color_green}, {tag.color_blue})
          </span>
        </div>
      ),
    },
  ];

  if (!loading && items.length === 0) {
    return (
      <>
        <PageHeader title="Tags" description="Gestiona las etiquetas para las tareas del kanban" />
        <EmptyState
          title="Aún no hay tags"
          description="Crea tu primer tag para empezar a etiquetar tareas."
          href="/kanban/tags/new"
          hrefLabel="Crear tag"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Tags"
        description="Gestiona las etiquetas para las tareas del kanban"
        createHref="/kanban/tags/new"
        createLabel="Crear tag"
      />
      <div className="px-6">
        <EntityTable
          data={items}
          columns={columns}
          editHref={(tag: TagKanban) => `/kanban/tags/${tag.id}/edit`}
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
        title="¿Eliminar tag?"
        itemName={itemToDelete?.nombre || ''}
        onConfirm={confirmDelete}
      />
    </>
  );
}
