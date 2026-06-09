'use client';

import { useState, useCallback, useEffect } from 'react';
import { useProductVariableStore } from '@/stores';
import { PageHeader } from '@/components/layout';
import { EntityTable } from '@/components/tables';
import { ConfirmDeleteModal } from '@/components/modals';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { ProductVariable } from '@/types';

export default function ProductVariablesPage() {
  const { items, totalItems, currentPage, pageSize, loading, getAll, delete: deleteVariable } = useProductVariableStore();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProductVariable | null>(null);

  const fetch = useCallback(
    (page = 1) => getAll(page, pageSize),
    [getAll, pageSize],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDelete = useCallback((variable: ProductVariable) => {
    setItemToDelete(variable);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteVariable(itemToDelete.id);
      toast({
        title: 'Variable eliminada',
        description: 'La variable se ha eliminado correctamente',
        variant: 'success',
      });
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetch(currentPage);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al eliminar'), variant: 'error' });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, deleteVariable, toast, fetch, currentPage]);

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (pv: ProductVariable) => (
        <code className="rounded bg-lila-50 px-2 py-0.5 text-sm font-medium text-violet-lab">
          {pv.nombre}
        </code>
      ),
    },
  ];

  if (!loading && items.length === 0) {
    return (
      <>
        <PageHeader title="Variables Globales" description="Gestiona las variables disponibles para fórmulas" />
        <EmptyState
          title="Aún no hay variables"
          description="Crea tu primera variable global para usarla en las fórmulas de tus productos."
          href="/product-variables/new"
          hrefLabel="Crear variable"
          icon="variable"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Variables Globales"
        description="Gestiona las variables disponibles para fórmulas"
        createHref="/product-variables/new"
        createLabel="Crear variable"
      />
      <div className="px-6">
        <EntityTable
          data={items}
          columns={columns}
          editHref={(pv) => `/product-variables/${pv.id}/edit`}
          onDelete={handleDelete}
          pagination={{
            currentPage,
            totalItems,
            pageSize,
            onPageChange: fetch,
          }}
        />
      </div>
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="¿Eliminar variable?"
        itemName={itemToDelete?.nombre || ''}
        onConfirm={confirmDelete}
      />
    </>
  );
}
