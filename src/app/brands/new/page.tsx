'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { BrandForm } from '@/components/forms';

export default function NewBrandPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) router.push('/brands');
  }, [isAdmin, router]);

  if (!isAdmin) return null;

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
