'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { ProductVariableForm } from '@/components/forms';

export default function NewProductVariablePage() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) router.push('/product-variables');
  }, [isAdmin, router]);

  if (!isAdmin) return null;

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
