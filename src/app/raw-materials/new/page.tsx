'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { RawMaterialForm } from '@/components/forms';

export default function NewRawMaterialPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) router.push('/raw-materials');
  }, [isAdmin, router]);

  if (!isAdmin) return null;

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
