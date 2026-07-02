'use client';

import { PageHeader } from '@/components/layout';
import { PrioridadKanbanForm } from '@/components/forms/prioridad-kanban-form';

export default function NewPrioridadKanbanPage() {
  return (
    <>
      <PageHeader title="Nueva prioridad" description="Ingresa los datos de la nueva prioridad" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <PrioridadKanbanForm mode="create" />
        </div>
      </div>
    </>
  );
}
