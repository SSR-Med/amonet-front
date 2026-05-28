'use client'
import { useState, useCallback } from 'react';
import { useRawMaterialStore, useProductStore } from '@/stores';
import { PageHeader } from '@/components/layout';
import { EntityTable } from '@/components/tables';
import { ConfirmDeleteModal } from '@/components/modals';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { RawMaterial } from '@/types';

export default function RawMaterialsPage() {
  const { getAll, delete: deleteRawMaterial, isNameUnique } = useRawMaterialStore();
  const { products } = useProductStore();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RawMaterial | null>(null);
  const rawMaterials = getAll();

  const handleDelete = useCallback((rawMaterial: RawMaterial) => {
    setItemToDelete(rawMaterial);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!itemToDelete) return;
    const usedInProducts = products.some((p) =>
      p.rawMaterials.some((rm) => rm.rawMaterialId === itemToDelete.id)
    );
    if (usedInProducts) {
      toast({
        title: 'No se puede eliminar',
        description: 'Esta materia prima está asignada a productos existentes',
        variant: 'warning',
      });
      setDeleteModalOpen(false);
      return;
    }
    deleteRawMaterial(itemToDelete.id);
    toast({
      title: 'Materia prima eliminada',
      description: 'La materia prima se ha eliminado correctamente',
      variant: 'success',
    });
    setDeleteModalOpen(false);
    setItemToDelete(null);
  }, [itemToDelete, deleteRawMaterial, products, toast]);

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (rm: RawMaterial) => (
        <span className="font-medium text-gray-900">{rm.name}</span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (rm: RawMaterial) => (
        <Badge variant={rm.type === 'chemical' ? 'chemical' : 'packaging'}>
          {rm.type === 'chemical' ? '● Químico' : '● Empaquetado'}
        </Badge>
      ),
    },
  ];

  if (rawMaterials.length === 0) {
    return (
      <>
        <PageHeader title="Materias Primas" description="Gestiona las materias primas de tus productos" />
        <EmptyState
          title="Aún no hay materias primas"
          description="Crea tu primera materia prima para comenzar a gestionar tus productos."
          href="/raw-materials/new"
          hrefLabel="Crear materia prima"
          icon="material"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Materias Primas"
        description="Gestiona las materias primas de tus productos"
        createHref="/raw-materials/new"
        createLabel="Crear materia prima"
      />
      <div className="px-6">
        <EntityTable
          data={rawMaterials}
          columns={columns}
          editHref={(rm) => `/raw-materials/${rm.id}/edit`}
          onDelete={handleDelete}
        />
      </div>
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="¿Eliminar materia prima?"
        description={itemToDelete ? 'Esta materia prima está asignada a productos existentes' : undefined}
        itemName={itemToDelete?.name || ''}
        onConfirm={confirmDelete}
      />
    </>
  );
}
