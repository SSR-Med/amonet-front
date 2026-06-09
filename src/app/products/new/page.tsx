'use client';

import { PageHeader } from '@/components/layout';
import { ProductForm } from '@/components/forms';

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Nuevo producto" description="Ingresa los datos del nuevo producto" />
      <div className="px-6 py-4">
        <div className="max-w-2xl">
          <ProductForm mode="create" />
        </div>
      </div>
    </>
  );
}
