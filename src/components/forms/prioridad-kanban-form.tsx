'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { prioridadKanbanSchema, PrioridadKanbanFormData } from '@/types/schemas';
import { usePrioridadKanbanStore } from '@/stores/prioridad-kanban-store';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { FormField } from './form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';

interface PrioridadKanbanFormProps {
  initialData?: PrioridadKanbanFormData;
  entityId?: string;
  mode?: 'create' | 'edit';
}

export function PrioridadKanbanForm({ initialData, entityId, mode = 'create' }: PrioridadKanbanFormProps) {
  const router = useRouter();
  const { create, update } = usePrioridadKanbanStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PrioridadKanbanFormData>({
    resolver: zodResolver(prioridadKanbanSchema),
    defaultValues: initialData || { nombre: '', color_red: 0, color_green: 0, color_blue: 0 },
  });

  const colorRed = watch('color_red');
  const colorGreen = watch('color_green');
  const colorBlue = watch('color_blue');

  const onSubmit = async (data: PrioridadKanbanFormData) => {
    try {
      if (mode === 'create') {
        await create(data);
        toast({ title: 'Prioridad creada', description: 'La prioridad se ha creado correctamente', variant: 'success' });
      } else {
        if (!entityId) return;
        await update(entityId, data);
        toast({ title: 'Prioridad actualizada', description: 'La prioridad se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/kanban/prioridades');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Nombre" error={errors.nombre?.message}>
        <Input {...register('nombre')} placeholder="Ej: alta, media, baja" />
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
        <Button type="button" variant="secondary" onClick={() => router.push('/kanban/prioridades')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? 'Crear prioridad' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
