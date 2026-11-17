'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { canManageProduction } from '@/lib/access';
import { PageHeader } from '@/components/layout';
import { ProductVariableForm } from '@/components/forms';

export default function NewProductVariablePage() {
  const { user } = useAuth();
  const canManage = canManageProduction(user?.rol);
  const router = useRouter();

  useEffect(() => {
    if (!canManage) router.push('/product-variables');
  }, [canManage, router]);

  if (!canManage) return null;

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
