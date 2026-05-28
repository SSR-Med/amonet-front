'use client'
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useProductStore, useBrandStore } from '@/stores';
import { PageHeader } from '@/components/layout';
import { ConfirmDeleteModal } from '@/components/modals';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';

export default function ProductsPage() {
  const { getAll, delete: deleteProduct } = useProductStore();
  const { getAll: getAllBrands, getById: getBrandById } = useBrandStore();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Product | null>(null);
  const products = getAll();
  const brands = getAllBrands();

  const handleDelete = useCallback((product: Product) => {
    setItemToDelete(product);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!itemToDelete) return;
    deleteProduct(itemToDelete.id);
    toast({
      title: 'Producto eliminado',
      description: 'El producto se ha eliminado correctamente',
      variant: 'success',
    });
    setDeleteModalOpen(false);
    setItemToDelete(null);
  }, [itemToDelete, deleteProduct, toast]);

  if (products.length === 0) {
    return (
      <>
        <PageHeader title="Productos" description="Gestiona tus productos terminados" />
        <EmptyState
          title="Aún no hay productos"
          description="Crea tu primer producto para comenzar a gestionar tu inventario."
          href="/products/new"
          hrefLabel="Crear producto"
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
        createHref="/products/new"
        createLabel="Crear producto"
      />
      <div className="px-6">
        <div className="border border-border-tabla rounded-8 overflow-hidden">
          <table className="w-full">
            <thead className="bg-lavanda-soft">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gris-tecnico">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gris-tecnico">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gris-tecnico">Marca</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gris-tecnico">Materias Primas</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gris-tecnico w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-tabla">
              {products.map((product) => {
                const brand = getBrandById(product.brandId);
                return (
                  <tr key={product.id} className="hover:bg-lila-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gris-tecnico">{product.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {brand ? (
                        <Badge variant="default">{brand.name}</Badge>
                      ) : (
                        <span className="text-gris-tecnico">Sin marca</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{product.rawMaterials.length}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/products/${product.id}/edit`}>
                            <Pencil className="h-4 w-4 text-violet-lab" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="h-4 w-4 text-coral-alerta" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="¿Eliminar producto?"
        itemName={itemToDelete?.name || ''}
        onConfirm={confirmDelete}
      />
    </>
  );
}
