'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { RawMaterialForm } from '@/components/forms';
import * as rawMaterialsApi from '@/lib/api/raw-materials';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { RawMaterial } from '@/types';

export default function EditRawMaterialPage() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [rawMaterial, setRawMaterial] = useState<RawMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) router.push('/raw-materials');
  }, [isAdmin, router]);

  useEffect(() => {
    (async () => {
      try {
        const data = await rawMaterialsApi.getRawMaterialById(params.id as string);
        setRawMaterial(data);
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al cargar materia prima'), variant: 'error' });
        router.push('/raw-materials');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, toast]);

  if (!isAdmin || loading) return null;
  if (!rawMaterial) return null;

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
