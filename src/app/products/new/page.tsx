'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { canManageProduction } from '@/lib/access';
import { PageHeader } from '@/components/layout';
import { ProductForm } from '@/components/forms';

export default function NewProductPage() {
  const { user } = useAuth();
  const canManage = canManageProduction(user?.rol);
  const router = useRouter();

  useEffect(() => {
    if (!canManage) router.push('/products');
  }, [canManage, router]);

  if (!canManage) return null;

  return (
    <>
      <PageHeader title="Nuevo producto" description="Ingresa los datos del nuevo producto" />
      <div className="px-6 py-4">
        <div className="max-w-2xl">
          <ProductForm mode="create" />
        </div>
      </div>
    </>
  );
}
