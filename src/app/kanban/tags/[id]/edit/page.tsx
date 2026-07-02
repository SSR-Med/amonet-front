'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { TagKanbanForm } from '@/components/forms/tag-kanban-form';
import * as tagsApi from '@/lib/api/tags-kanban';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { TagKanban } from '@/types';

export default function EditTagKanbanPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [tag, setTag] = useState<TagKanban | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await tagsApi.getTagKanbanById(params.id as string);
        setTag(data);
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
        router.push('/kanban/tags');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, toast]);

  if (loading) return null;
  if (!tag) return null;

  return (
    <>
      <PageHeader title="Editar tag" description="Modifica los datos del tag" />
      <div className="px-6 py-4">
        <div className="max-w-md">
          <TagKanbanForm
            initialData={{
              nombre: tag.nombre,
              color_red: tag.color_red,
              color_green: tag.color_green,
              color_blue: tag.color_blue,
            }}
            entityId={tag.id}
            mode="edit"
          />
        </div>
      </div>
    </>
  );
}
