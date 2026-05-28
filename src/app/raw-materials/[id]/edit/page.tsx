'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { RawMaterialForm } from '@/components/forms';
import { useRawMaterialStore } from '@/stores';

export default function EditRawMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const { getById } = useRawMaterialStore();

  const rawMaterial = getById(params.id as string);

  if (!rawMaterial) {
    router.push('/raw-materials');
    return null;
  }

  return (
    <>
      <PageHeader title="Editar materia prima" description="Modifica los datos de la materia prima" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <RawMaterialForm initialData={{ name: rawMaterial.name, type: rawMaterial.type }} entityId={rawMaterial.id} mode="edit" />
        </div>
      </div>
    </>
  );
}
