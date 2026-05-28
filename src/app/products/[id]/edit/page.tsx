'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { ProductForm } from '@/components/forms';
import { useProductStore } from '@/stores';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { getById } = useProductStore();

  const product = getById(params.id as string);

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
              name: product.name,
              code: product.code,
              brandId: product.brandId,
              rawMaterials: product.rawMaterials,
            }}
            entityId={product.id}
            mode="edit"
          />
        </div>
      </div>
    </>
  );
}
