'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList, Kanban } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-lavanda-soft p-8">
      <div className="w-full max-w-3xl">
        <h1 className="mb-2 text-center text-3xl font-semibold text-lila-900">
          Amonet
        </h1>
        <p className="mb-10 text-center text-base text-gris-tecnico">
          Seleccioná una aplicación para comenzar
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <button
            onClick={() => router.push('/products')}
            className="group flex flex-col items-center gap-6 rounded-2xl border-2 border-border-tabla bg-white p-12 shadow-sm transition-all hover:border-violet-lab hover:shadow-md"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-50 group-hover:bg-violet-100 transition-colors">
              <ClipboardList className="h-10 w-10 text-violet-lab" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-lila-900">
                Producción
              </h2>
              <p className="mt-1 text-sm text-gris-tecnico">
                Productos, marcas, materias primas, inventario y órdenes de producción
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push('/kanban')}
            className="group flex flex-col items-center gap-6 rounded-2xl border-2 border-border-tabla bg-white p-12 shadow-sm transition-all hover:border-violet-lab hover:shadow-md"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-50 group-hover:bg-violet-100 transition-colors">
              <Kanban className="h-10 w-10 text-violet-lab" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-lila-900">
                Planeación
              </h2>
              <p className="mt-1 text-sm text-gris-tecnico">
                Kanban board, sprints, tareas y seguimiento del equipo
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
