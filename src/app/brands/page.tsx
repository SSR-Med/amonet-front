'use client';

import { useState, useCallback, useEffect } from 'react';
import { useBrandStore } from '@/stores';
import { PageHeader } from '@/components/layout';
import { EntityTable } from '@/components/tables';
import { ConfirmDeleteModal } from '@/components/modals';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { Brand } from '@/types';

export default function BrandsPage() {
  const { items: brands, totalItems, currentPage, pageSize, loading, getAll, delete: deleteBrand } = useBrandStore();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Brand | null>(null);

  const fetchBrands = useCallback(
    (page = 1) => getAll(page, pageSize),
    [getAll, pageSize],
  );

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleDelete = useCallback((brand: Brand) => {
    setItemToDelete(brand);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteBrand(itemToDelete.id);
      toast({
        title: 'Marca eliminada',
        description: 'La marca se ha eliminado correctamente',
        variant: 'success',
      });
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchBrands(currentPage);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al eliminar'), variant: 'error' });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, deleteBrand, toast, fetchBrands, currentPage]);

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (brand: Brand) => (
        <span className="font-medium text-gray-900">{brand.nombre}</span>
      ),
    },
  ];

  if (!loading && brands.length === 0) {
    return (
      <>
        <PageHeader title="Marcas" description="Gestiona las marcas de tus productos" />
        <EmptyState
          title="Aún no hay marcas"
          description="Crea tu primera marca para comenzar a gestionar tus productos."
          href="/brands/new"
          hrefLabel="Crear marca"
          icon="brand"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Marcas"
        description="Gestiona las marcas de tus productos"
        createHref="/brands/new"
        createLabel="Crear marca"
      />
      <div className="px-6">
        <EntityTable
          data={brands}
          columns={columns}
          editHref={(brand) => `/brands/${brand.id}/edit`}
          onDelete={handleDelete}
          pagination={{
            currentPage,
            totalItems,
            pageSize,
            onPageChange: fetchBrands,
          }}
        />
      </div>
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="¿Eliminar marca?"
        description={itemToDelete ? 'Esta marca está asignada a productos existentes' : undefined}
        itemName={itemToDelete?.nombre || ''}
        onConfirm={confirmDelete}
      />
    </>
  );
}
