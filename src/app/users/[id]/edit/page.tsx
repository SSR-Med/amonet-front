'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { UserForm } from '@/components/forms/user-form';
import * as usersApi from '@/lib/api/users';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { User } from '@/types';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await usersApi.getUserById(params.id as string);
        setUser(data);
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
        router.push('/users');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, toast]);

  if (loading) return null;
  if (!user) return null;

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
