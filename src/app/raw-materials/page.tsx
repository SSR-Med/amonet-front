'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRawMaterialStore } from '@/stores';
import { PageHeader } from '@/components/layout';
import { EntityTable } from '@/components/tables';
import { ConfirmDeleteModal } from '@/components/modals';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { RawMaterial } from '@/types';

export default function RawMaterialsPage() {
  const { isAdmin } = useAuth();
  const { items, totalItems, currentPage, pageSize, loading, getAll, delete: deleteRawMaterial } = useRawMaterialStore();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RawMaterial | null>(null);

  const fetch = useCallback(
    (page = 1) => getAll(page, pageSize),
    [getAll, pageSize],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDelete = useCallback((rawMaterial: RawMaterial) => {
    setItemToDelete(rawMaterial);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteRawMaterial(itemToDelete.id);
      toast({
        title: 'Materia prima eliminada',
        description: 'La materia prima se ha eliminado correctamente',
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
  }, [itemToDelete, deleteRawMaterial, toast, fetch, currentPage]);

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (rm: RawMaterial) => (
        <span className="font-medium text-gray-900">{rm.nombre}</span>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (rm: RawMaterial) => (
        <Badge variant={
          rm.tipo_materia_prima.nombre === 'QUIMICO' ? 'chemical' : 'packaging'
        }>
          ● {rm.tipo_materia_prima.nombre}
        </Badge>
      ),
    },
    {
      key: 'unidad',
      header: 'Unidad',
      render: (rm: RawMaterial) => (
        <span className="text-sm text-gris-tecnico">{rm.tipo_unidad.abreviacion}</span>
      ),
    },
  ];

  if (!loading && items.length === 0) {
    return (
      <>
        <PageHeader title="Materias Primas" description="Gestiona las materias primas de tus productos" />
        <EmptyState
          title="Aún no hay materias primas"
          description="Crea tu primera materia prima para comenzar a gestionar tus productos."
          {...(isAdmin ? { href: '/raw-materials/new', hrefLabel: 'Crear materia prima' } : {})}
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
        {...(isAdmin ? { createHref: '/raw-materials/new', createLabel: 'Crear materia prima' } : {})}
      />
      <div className="px-6">
        <EntityTable
          data={items}
          columns={columns}
          {...(isAdmin ? { editHref: (rm: RawMaterial) => `/raw-materials/${rm.id}/edit`, onDelete: handleDelete } : { hideActions: true })}
          pagination={{
            currentPage,
            totalItems,
            pageSize,
            onPageChange: fetch,
          }}
        />
      </div>
      {isAdmin && (
        <ConfirmDeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="¿Eliminar materia prima?"
          description={itemToDelete ? 'Esta materia prima está asignada a productos existentes' : undefined}
          itemName={itemToDelete?.nombre || ''}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
