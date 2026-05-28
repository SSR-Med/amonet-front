'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { brandSchema, BrandFormData } from '@/types/schemas';
import { useBrandStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { FormField } from './form-field';
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
    const nameExists = isNameUnique(data.name, entityId);
    if (!nameExists) {
      setError('name', { message: 'Este nombre ya está en uso' });
      return;
    }

    try {
      if (mode === 'create') {
        create(data.name);
        toast({ title: 'Marca creada', description: 'La marca se ha creado correctamente', variant: 'success' });
      } else {
        if (!entityId) return;
        update(entityId, data.name);
        toast({ title: 'Marca actualizada', description: 'La marca se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/brands');
    } catch {
      toast({ title: 'Error', description: 'Ha ocurrido un error inesperado', variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Nombre" error={errors.name?.message}>
        <input
          {...register('name')}
          type="text"
          className="flex h-9 w-full rounded-8 border border-border-tabla bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gris-tecnico focus:border-2 focus:border-violet-lab focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Nombre de la marca"
        />
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
