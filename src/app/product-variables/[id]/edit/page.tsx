'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { ProductVariableForm } from '@/components/forms';
import { useProductVariableStore } from '@/stores';

export default function EditProductVariablePage() {
  const params = useParams();
  const router = useRouter();
  const { getById, getAll, items, loading } = useProductVariableStore();

  useEffect(() => {
    if (items.length === 0) {
      getAll();
    }
  }, [items.length, getAll]);

  const variable = getById(params.id as string);

  if (loading && !variable) return null;

  if (!variable) {
    router.push('/product-variables');
    return null;
  }

  return (
    <>
      <PageHeader title="Editar variable" description="Modifica los datos de la variable global" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <ProductVariableForm initialData={{ nombre: variable.nombre }} entityId={variable.id} mode="edit" />
        </div>
      </div>
    </>
  );
}
