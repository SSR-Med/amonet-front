'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { UserForm } from '@/components/forms/user-form';
import { useUserStore } from '@/stores';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { items: users, getAll, loading } = useUserStore();

  useEffect(() => {
    if (users.length === 0) {
      getAll();
    }
  }, [users.length, getAll]);

  const user = users.find((u) => u.id === params.id);

  if (loading && !user) return null;

  if (!user) {
    router.push('/users');
    return null;
  }

  return (
    <>
      <PageHeader title="Editar usuario" description="Modifica los datos del usuario" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <UserForm
            initialData={{ id: user.id, documento: user.documento, nombre: user.nombre, rol: user.rol, activo: user.activo }}
            mode="edit"
          />
        </div>
      </div>
    </>
  );
}
