'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { canManageProduction } from '@/lib/access';
import { PageHeader } from '@/components/layout';
import { BrandForm } from '@/components/forms';

export default function NewBrandPage() {
  const { user } = useAuth();
  const canManage = canManageProduction(user?.rol);
  const router = useRouter();

  useEffect(() => {
    if (!canManage) router.push('/brands');
  }, [canManage, router]);

  if (!canManage) return null;

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
