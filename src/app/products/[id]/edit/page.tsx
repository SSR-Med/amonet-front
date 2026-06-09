'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { ProductForm } from '@/components/forms';
import { useProductStore } from '@/stores';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { getById, getAll, items, loading } = useProductStore();

  useEffect(() => {
    if (items.length === 0) getAll();
  }, [items.length, getAll]);

  const product = getById(params.id as string);

  if (loading && !product) return null;

  if (!product) {
    router.push('/products');
    return null;
  }

  return (
    <>
      <PageHeader title="Editar producto" description="Modifica los datos del producto" />
      <div className="px-6 py-4">
        <div className="max-w-2xl">
          <ProductForm
            initialData={{
              codigo: product.codigo,
              nombre: product.nombre,
              id_amonet_marca: product.marca.id,
              materias_primas: product.materias_primas.map((mp) => ({
                id_amonet_materia_prima: mp.id,
                formula: mp.formula,
              })),
            }}
            entityId={product.id}
            mode="edit"
          />
        </div>
      </div>
    </>
  );
}
