'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { tagKanbanSchema, TagKanbanFormData } from '@/types/schemas';
import { useTagKanbanStore } from '@/stores/tag-kanban-store';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { FormField } from './form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';

interface TagKanbanFormProps {
  initialData?: TagKanbanFormData;
  entityId?: string;
  mode?: 'create' | 'edit';
}

export function TagKanbanForm({ initialData, entityId, mode = 'create' }: TagKanbanFormProps) {
  const router = useRouter();
  const { create, update } = useTagKanbanStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TagKanbanFormData>({
    resolver: zodResolver(tagKanbanSchema),
    defaultValues: initialData || { nombre: '', color_red: 0, color_green: 0, color_blue: 0 },
  });

  const colorRed = watch('color_red');
  const colorGreen = watch('color_green');
  const colorBlue = watch('color_blue');

  const onSubmit = async (data: TagKanbanFormData) => {
    try {
      if (mode === 'create') {
        await create(data);
        toast({ title: 'Tag creado', description: 'El tag se ha creado correctamente', variant: 'success' });
      } else {
        if (!entityId) return;
        await update(entityId, data);
        toast({ title: 'Tag actualizado', description: 'El tag se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/kanban/tags');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Nombre" error={errors.nombre?.message}>
        <Input {...register('nombre')} placeholder="Ej: urgente, bug, mejora" />
      </FormField>

      <FormField label="Color">
        <ColorPicker
          value={{ r: colorRed, g: colorGreen, b: colorBlue }}
          onChange={(c) => {
            setValue('color_red', c.r);
            setValue('color_green', c.g);
            setValue('color_blue', c.b);
          }}
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={() => router.push('/kanban/tags')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? 'Crear tag' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
