'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { BrandForm } from '@/components/forms';
import * as brandsApi from '@/lib/api/brands';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { Brand } from '@/types';

export default function EditBrandPage() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) router.push('/brands');
  }, [isAdmin, router]);

  useEffect(() => {
    (async () => {
      try {
        const data = await brandsApi.getBrandById(params.id as string);
        setBrand(data);
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al cargar marca'), variant: 'error' });
        router.push('/brands');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, toast]);

  if (!isAdmin || loading) return null;
  if (!brand) return null;

  return (
    <>
      <PageHeader title="Editar marca" description="Modifica los datos de la marca" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <BrandForm initialData={{ nombre: brand.nombre }} entityId={brand.id} mode="edit" />
        </div>
      </div>
    </>
  );
}
