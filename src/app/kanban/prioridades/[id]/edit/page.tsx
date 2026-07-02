'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { PrioridadKanbanForm } from '@/components/forms/prioridad-kanban-form';
import * as prioridadesApi from '@/lib/api/prioridades-kanban';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { PrioridadKanban } from '@/types';

export default function EditPrioridadKanbanPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [prioridad, setPrioridad] = useState<PrioridadKanban | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await prioridadesApi.getPrioridadKanbanById(params.id as string);
        setPrioridad(data);
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
        router.push('/kanban/prioridades');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, toast]);

  if (loading) return null;
  if (!prioridad) return null;

  return (
    <>
      <PageHeader title="Editar prioridad" description="Modifica los datos de la prioridad" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <PrioridadKanbanForm
            initialData={{
              nombre: prioridad.nombre,
              color_red: prioridad.color_red,
              color_green: prioridad.color_green,
              color_blue: prioridad.color_blue,
            }}
            entityId={prioridad.id}
            mode="edit"
          />
        </div>
      </div>
    </>
  );
}
