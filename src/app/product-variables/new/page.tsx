'use client'
import { PageHeader } from '@/components/layout';
import { ProductVariableForm } from '@/components/forms';

export default function NewProductVariablePage() {
  return (
    <>
      <PageHeader title="Nueva variable" description="Ingresa los datos de la nueva variable global" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <ProductVariableForm mode="create" />
        </div>
      </div>
    </>
  );
}
