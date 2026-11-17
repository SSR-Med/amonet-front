'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { canManageProduction } from '@/lib/access';
import { PageHeader } from '@/components/layout';
import { ProductVariableForm } from '@/components/forms';
import * as productVariablesApi from '@/lib/api/product-variables';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { ProductVariable } from '@/types';

export default function EditProductVariablePage() {
  const { user } = useAuth();
  const canManage = canManageProduction(user?.rol);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [variable, setVariable] = useState<ProductVariable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canManage) router.push('/product-variables');
  }, [canManage, router]);

  useEffect(() => {
    (async () => {
      try {
        const data = await productVariablesApi.getProductVariableById(params.id as string);
        setVariable(data);
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
        router.push('/product-variables');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, toast]);

  if (!canManage || loading) return null;
  if (!variable) return null;

  return (
    <>
      <PageHeader title="Editar variable" description="Modifica los datos de la variable global" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <ProductVariableForm initialData={{ nombre: variable.nombre }} entityId={variable.id} mode="edit" />
        </div>
      </div>
    </>
  );
}
