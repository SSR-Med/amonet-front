'use client';

import { PageHeader } from '@/components/layout';
import { UserForm } from '@/components/forms/user-form';

export default function NewUserPage() {
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
