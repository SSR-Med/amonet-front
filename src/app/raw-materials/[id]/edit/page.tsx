'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { RawMaterialForm } from '@/components/forms';
import { useRawMaterialStore } from '@/stores';

export default function EditRawMaterialPage() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { getById, getAll, items, loading } = useRawMaterialStore();

  useEffect(() => {
    if (items.length === 0) {
      getAll();
    }
  }, [items.length, getAll]);

  useEffect(() => {
    if (!isAdmin) router.push('/raw-materials');
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  const rawMaterial = getById(params.id as string);

  if (loading && !rawMaterial) return null;

  if (!rawMaterial) {
    router.push('/raw-materials');
    return null;
  }

  return (
    <>
      <PageHeader title="Editar materia prima" description="Modifica los datos de la materia prima" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <RawMaterialForm
            initialData={{
              nombre: rawMaterial.nombre,
              id_cat_amonet_tipo_materia_prima: rawMaterial.tipo_materia_prima.id,
              id_cat_amonet_tipo_unidad: rawMaterial.tipo_unidad.id,
            }}
            entityId={rawMaterial.id}
            mode="edit"
          />
        </div>
      </div>
    </>
  );
}
