'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { rawMaterialSchema, RawMaterialFormData } from '@/types/schemas';
import { useRawMaterialStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { FormField } from './form-field';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RawMaterialType } from '@/types';

interface RawMaterialFormProps {
  initialData?: RawMaterialFormData;
  entityId?: string;
  mode?: 'create' | 'edit';
}

export function RawMaterialForm({ initialData, entityId, mode = 'create' }: RawMaterialFormProps) {
  const router = useRouter();
  const { create, update, isNameUnique } = useRawMaterialStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RawMaterialFormData>({
    resolver: zodResolver(rawMaterialSchema),
    defaultValues: initialData,
  });

  const typeValue = watch('type');

  const onSubmit = async (data: RawMaterialFormData) => {
    if (!data.type) {
      setError('type', { message: 'El tipo es requerido' });
      return;
    }

    const nameExists = isNameUnique(data.name, entityId);
    if (!nameExists) {
      setError('name', { message: 'Este nombre ya está en uso' });
      return;
    }

    try {
      if (mode === 'create') {
        create(data.name, data.type as RawMaterialType);
        toast({ title: 'Materia prima creada', description: 'La materia prima se ha creado correctamente', variant: 'success' });
      } else {
        if (!entityId) return;
        update(entityId, data.name, data.type as RawMaterialType);
        toast({ title: 'Materia prima actualizada', description: 'La materia prima se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/raw-materials');
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
          placeholder="Nombre de la materia prima"
        />
      </FormField>

      <FormField label="Tipo" error={errors.type?.message}>
        <Select value={typeValue} onValueChange={(value) => setValue('type', value as RawMaterialType)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chemical">
              <Badge variant="chemical" className="mr-2">●</Badge>
              Químico
            </SelectItem>
            <SelectItem value="packaging">
              <Badge variant="packaging" className="mr-2">●</Badge>
              Empaquetado
            </SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={() => router.push('/raw-materials')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? 'Crear materia prima' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
