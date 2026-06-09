'use client';

import { PageHeader } from '@/components/layout';
import { BrandForm } from '@/components/forms';

export default function NewBrandPage() {
  return (
    <>
      <PageHeader title="Nueva marca" description="Ingresa los datos de la nueva marca" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <BrandForm mode="create" />
        </div>
      </div>
    </>
  );
}
