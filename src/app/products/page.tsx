'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useProductStore } from '@/stores';
import { PageHeader } from '@/components/layout';
import { EntityTable } from '@/components/tables';
import { ConfirmDeleteModal } from '@/components/modals';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { Product } from '@/types';

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const { items, totalItems, currentPage, pageSize, loading, getAll, delete: deleteProduct } = useProductStore();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Product | null>(null);

  const fetch = useCallback(
    (page = 1) => getAll(page, pageSize),
    [getAll, pageSize],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDelete = useCallback((product: Product) => {
    setItemToDelete(product);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteProduct(itemToDelete.id);
      toast({
        title: 'Producto eliminado',
        description: 'El producto se ha eliminado correctamente',
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
  }, [itemToDelete, deleteProduct, toast, fetch, currentPage]);

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (product: Product) => (
        <span className="font-medium text-gray-900">{product.nombre}</span>
      ),
    },
    {
      key: 'codigo',
      header: 'Código',
      render: (product: Product) => (
        <span className="text-sm text-gris-tecnico">{product.codigo}</span>
      ),
    },
    {
      key: 'marca',
      header: 'Marca',
      render: (product: Product) => (
        <Badge variant="default">{product.marca.nombre}</Badge>
      ),
    },
    {
      key: 'materias_primas',
      header: 'Materias Primas',
      render: (product: Product) => (
        <Badge variant="default">{product.materias_primas.length}</Badge>
      ),
    },
  ];

  if (!loading && items.length === 0) {
    return (
      <>
        <PageHeader title="Productos" description="Gestiona tus productos terminados" />
        <EmptyState
          title="Aún no hay productos"
          description="Crea tu primer producto para comenzar a gestionar tu inventario."
          {...(isAdmin ? { href: '/products/new', hrefLabel: 'Crear producto' } : {})}
          icon="product"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Productos"
        description="Gestiona tus productos terminados"
        {...(isAdmin ? { createHref: '/products/new', createLabel: 'Crear producto' } : {})}
      />
      <div className="px-6">
        <EntityTable
          data={items}
          columns={columns}
          {...(isAdmin ? { editHref: (product: Product) => `/products/${product.id}/edit`, onDelete: handleDelete } : { hideActions: true })}
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
          title="¿Eliminar producto?"
          itemName={itemToDelete?.nombre || ''}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
