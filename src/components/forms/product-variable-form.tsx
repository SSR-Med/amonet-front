'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { productVariableSchema, ProductVariableFormData } from '@/types/schemas';
import { useProductVariableStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { FormField } from './form-field';
import { Button } from '@/components/ui/button';

interface ProductVariableFormProps {
  initialData?: ProductVariableFormData;
  entityId?: string;
  mode?: 'create' | 'edit';
}

export function ProductVariableForm({ initialData, entityId, mode = 'create' }: ProductVariableFormProps) {
  const router = useRouter();
  const { create, update, isNameUnique } = useProductVariableStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductVariableFormData>({
    resolver: zodResolver(productVariableSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ProductVariableFormData) => {
    const nameExists = isNameUnique(data.name, entityId);
    if (!nameExists) {
      setError('name', { message: 'Este nombre ya está en uso' });
      return;
    }

    try {
      if (mode === 'create') {
        create(data.name);
        toast({ title: 'Variable creada', description: 'La variable se ha creado correctamente', variant: 'success' });
      } else {
        if (!entityId) return;
        update(entityId, data.name);
        toast({ title: 'Variable actualizada', description: 'La variable se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/product-variables');
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
          className="flex h-9 w-full rounded-8 border border-border-tabla bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gris-tecnico focus:border-2 focus:border-violet-lab focus:outline-none"
          placeholder="peso_neto"
        />
      </FormField>
      <p className="text-xs text-gris-tecnico">
        Usa este nombre como referencia en las fórmulas. Solo letras, números y guiones bajos.
      </p>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={() => router.push('/product-variables')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? 'Crear variable' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
