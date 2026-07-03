'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { ProductForm } from '@/components/forms';

export default function NewProductPage() {
  const { isAdmin, isJefeProduccion } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin && !isJefeProduccion) router.push('/products');
  }, [isAdmin, isJefeProduccion, router]);

  if (!isAdmin && !isJefeProduccion) return null;

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
