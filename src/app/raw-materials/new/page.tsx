'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { canManageProduction } from '@/lib/access';
import { PageHeader } from '@/components/layout';
import { RawMaterialForm } from '@/components/forms';

export default function NewRawMaterialPage() {
  const { user } = useAuth();
  const canManage = canManageProduction(user?.rol);
  const router = useRouter();

  useEffect(() => {
    if (!canManage) router.push('/raw-materials');
  }, [canManage, router]);

  if (!canManage) return null;

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
