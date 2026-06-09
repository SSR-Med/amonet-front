'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { productVariableSchema, ProductVariableFormData } from '@/types/schemas';
import { useProductVariableStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { FormField } from './form-field';
import { Input } from '@/components/ui/input';
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
    const nameExists = isNameUnique(data.nombre, entityId);
    if (!nameExists) {
      setError('nombre', { message: 'Este nombre ya está en uso' });
      return;
    }

    try {
      if (mode === 'create') {
        await create(data.nombre);
        toast({ title: 'Variable creada', description: 'La variable se ha creado correctamente', variant: 'success' });
      } else {
        if (!entityId) return;
        await update(entityId, data.nombre);
        toast({ title: 'Variable actualizada', description: 'La variable se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/product-variables');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Nombre" error={errors.nombre?.message}>
        <Input {...register('nombre')} placeholder="peso_neto" />
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
