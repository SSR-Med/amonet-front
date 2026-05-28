'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { BrandForm } from '@/components/forms';
import { useBrandStore } from '@/stores';

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();
  const { getById } = useBrandStore();

  const brand = getById(params.id as string);

  if (!brand) {
    router.push('/brands');
    return null;
  }

  return (
    <>
      <PageHeader title="Editar marca" description="Modifica los datos de la marca" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <BrandForm initialData={{ name: brand.name }} entityId={brand.id} mode="edit" />
        </div>
      </div>
    </>
  );
}
