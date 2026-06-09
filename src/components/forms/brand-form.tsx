'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { brandSchema, BrandFormData } from '@/types/schemas';
import { useBrandStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { FormField } from './form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BrandFormProps {
  initialData?: BrandFormData;
  entityId?: string;
  mode?: 'create' | 'edit';
}

export function BrandForm({ initialData, entityId, mode = 'create' }: BrandFormProps) {
  const router = useRouter();
  const { create, update, isNameUnique } = useBrandStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: BrandFormData) => {
    const nameExists = isNameUnique(data.nombre, entityId);
    if (!nameExists) {
      setError('nombre', { message: 'Este nombre ya está en uso' });
      return;
    }

    try {
      if (mode === 'create') {
        await create(data.nombre);
        toast({ title: 'Marca creada', description: 'La marca se ha creado correctamente', variant: 'success' });
      } else {
        if (!entityId) return;
        await update(entityId, data.nombre);
        toast({ title: 'Marca actualizada', description: 'La marca se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/brands');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Nombre" error={errors.nombre?.message}>
        <Input {...register('nombre')} placeholder="Nombre de la marca" />
      </FormField>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={() => router.push('/brands')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? 'Crear marca' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
