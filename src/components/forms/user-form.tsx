'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { FormField } from './form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const userCreateSchema = z.object({
  documento: z.string().min(1, 'El documento es requerido').max(40, 'Máximo 40 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  password: z.string().min(1, 'La contraseña es requerida').max(255, 'Máximo 255 caracteres'),
  rol: z.string().min(1, 'El rol es requerido'),
});

const userEditSchema = z.object({
  documento: z.string().min(1, 'El documento es requerido').max(40, 'Máximo 40 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  password: z.string().max(255, 'Máximo 255 caracteres').optional().or(z.literal('')),
  rol: z.string().min(1, 'El rol es requerido'),
  activo: z.boolean(),
});

interface UserFormProps {
  initialData?: { id: string; documento: string; nombre: string; rol: string; activo?: boolean };
  mode?: 'create' | 'edit';
}

export function UserForm({ initialData, mode = 'create' }: UserFormProps) {
  const router = useRouter();
  const { create, update, roles, loadRoles } = useUserStore();
  const { toast } = useToast();

  const isEdit = mode === 'edit';
  const schema = isEdit ? userEditSchema : userCreateSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? { documento: initialData?.documento ?? '', nombre: initialData?.nombre ?? '', password: '', rol: initialData?.rol ?? '', activo: initialData?.activo ?? true }
      : undefined,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (roles.length === 0) loadRoles();
  }, [roles.length, loadRoles]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      if (mode === 'create') {
        await create({ documento: data.documento, nombre: data.nombre, password: data.password, rol: data.rol });
        toast({ title: 'Usuario creado', description: 'El usuario se ha creado correctamente', variant: 'success' });
      } else {
        if (!initialData?.id) return;
        const payload: Record<string, unknown> = { documento: data.documento, nombre: data.nombre, rol: data.rol, activo: data.activo };
        if (data.password) payload.password = data.password;
        await update(initialData.id, payload);
        toast({ title: 'Usuario actualizado', description: 'El usuario se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/users');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Documento" error={errors.documento?.message}>
        <Input {...register('documento')} placeholder="Documento del usuario" />
      </FormField>

      <FormField label="Nombre" error={errors.nombre?.message}>
        <Input {...register('nombre')} placeholder="Nombre del usuario" />
      </FormField>

      <FormField label="Contraseña" error={errors.password?.message}>
        <Input
          type="password"
          {...register('password')}
          placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Contraseña del usuario'}
        />
      </FormField>

      <Controller
        name="rol"
        control={control}
        render={({ field }) => (
          <FormField label="Rol" error={errors.rol?.message}>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />

      {isEdit && (
        <Controller
          name="activo"
          control={control}
          render={({ field }) => (
            <FormField label="Estado">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-lab focus:ring-offset-2 ${
                    field.value ? 'bg-verde-exito' : 'bg-coral-alerta'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      field.value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-900">
                  {field.value ? 'Activo' : 'Inactivo'}
                </span>
              </label>
            </FormField>
          )}
        />
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={() => router.push('/users')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
