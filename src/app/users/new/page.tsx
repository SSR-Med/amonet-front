'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { UserForm } from '@/components/forms/user-form';

export default function NewUserPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) router.push('/users');
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <>
      <PageHeader title="Nuevo usuario" description="Ingresa los datos del nuevo usuario" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <UserForm mode="create" />
        </div>
      </div>
    </>
  );
}
