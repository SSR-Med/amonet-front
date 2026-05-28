'use client'
import { PageHeader } from '@/components/layout';
import { RawMaterialForm } from '@/components/forms';

export default function NewRawMaterialPage() {
  return (
    <>
      <PageHeader title="Nueva materia prima" description="Ingresa los datos de la nueva materia prima" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <RawMaterialForm mode="create" />
        </div>
      </div>
    </>
  );
}
