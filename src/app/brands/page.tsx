'use client'
import { useState, useCallback } from 'react';
import { useBrandStore } from '@/stores';
import { PageHeader } from '@/components/layout';
import { EntityTable } from '@/components/tables';
import { ConfirmDeleteModal } from '@/components/modals';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import type { Brand } from '@/types';

export default function BrandsPage() {
  const { getAll, delete: deleteBrand, isNameUnique } = useBrandStore();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Brand | null>(null);
  const brands = getAll();

  const handleEdit = useCallback((brand: Brand) => {
    window.location.href = `/brands/${brand.id}/edit`;
  }, []);

  const handleDelete = useCallback((brand: Brand) => {
    setItemToDelete(brand);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!itemToDelete) return;
    const isInUse = false;
    if (isInUse) {
      toast({
        title: 'No se puede eliminar',
        description: 'Esta marca está asignada a productos existentes',
        variant: 'warning',
      });
      setDeleteModalOpen(false);
      return;
    }
    deleteBrand(itemToDelete.id);
    toast({
      title: 'Marca eliminada',
      description: 'La marca se ha eliminado correctamente',
      variant: 'success',
    });
    setDeleteModalOpen(false);
    setItemToDelete(null);
  }, [itemToDelete, deleteBrand, toast]);

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (brand: Brand) => (
        <span className="font-medium text-gray-900">{brand.name}</span>
      ),
    },
  ];

  if (brands.length === 0) {
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
        />
      </div>
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="¿Eliminar marca?"
        description={itemToDelete ? 'Esta marca está asignada a productos existentes' : undefined}
        itemName={itemToDelete?.name || ''}
        onConfirm={confirmDelete}
      />
    </>
  );
}
