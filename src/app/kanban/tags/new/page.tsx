'use client';

import { PageHeader } from '@/components/layout';
import { TagKanbanForm } from '@/components/forms/tag-kanban-form';

export default function NewTagKanbanPage() {
  return (
    <>
      <PageHeader title="Nuevo tag" description="Ingresa los datos del nuevo tag" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <TagKanbanForm mode="create" />
        </div>
      </div>
    </>
  );
}
