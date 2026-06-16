'use client';

import { useEffect, useState } from 'react';
import { ADMIN } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <PageHeader title="Mis Datos Personales" description="Información de tu cuenta" />
      <div className="px-6 py-4">
        <Card className="max-w-md p-6 space-y-4">
          <div>
            <p className="text-sm text-gris-tecnico">Documento</p>
            <p className="text-base font-medium text-gray-900">{user.documento}</p>
          </div>
          <div>
            <p className="text-sm text-gris-tecnico">Nombre</p>
            <p className="text-base font-medium text-gray-900">{user.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gris-tecnico">Rol</p>
            <Badge variant={user.rol === ADMIN ? 'chemical' : 'default'}>{user.rol}</Badge>
          </div>
        </Card>
      </div>
    </>
  );
}
