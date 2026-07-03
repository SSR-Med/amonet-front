'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { BrandForm } from '@/components/forms';

export default function NewBrandPage() {
  const { isAdmin, isJefeProduccion } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin && !isJefeProduccion) router.push('/brands');
  }, [isAdmin, isJefeProduccion, router]);

  if (!isAdmin && !isJefeProduccion) return null;

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
