'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRawMaterialStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import * as inventarioApi from '@/lib/api/inventario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout';
import type { InventarioItem } from '@/types';

export default function EditInventarioPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const { items: materiasPrimas, getAll: loadMateriasPrimas } = useRawMaterialStore();

  const [inventario, setInventario] = useState<InventarioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fechaIngreso, setFechaIngreso] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [lote, setLote] = useState('');
  const [amonetMateriaPrimaId, setAmonetMateriaPrimaId] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [contenedores, setContenedores] = useState<{ cantidad: number; cantidad_disponible: number; precio: number }[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);

  useEffect(() => {
    if (materiasPrimas.length === 0) loadMateriasPrimas();
  }, [materiasPrimas.length, loadMateriasPrimas]);

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const item = await inventarioApi.getInventarioById(params.id as string);
        setInventario(item);
        setFechaIngreso(item.fecha_ingreso.split('T')[0]);
        setProveedor(item.proveedor);
        setLote(item.lote);
        setAmonetMateriaPrimaId(item.amonet_materia_prima_id);
        setFechaVencimiento(item.fecha_vencimiento.split('T')[0]);
        setContenedores(
          item.contenedores.map((c) => ({
            cantidad: c.cantidad,
            cantidad_disponible: c.cantidad_disponible,
            precio: c.precio,
          }))
        );
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al cargar inventario'), variant: 'error' });
        router.push('/inventario');
      } finally {
        setLoading(false);
      }
    };
    fetchInventario();
  }, [params.id, router, toast]);

  const updateContenedor = (index: number, field: string, value: number) => {
    setContenedores((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: Math.max(0, value) } : c)));
  };

  const addContenedor = () => {
    setContenedores((prev) => [...prev, { cantidad: 0, cantidad_disponible: 0, precio: 0 }]);
  };

  const removeContenedor = (index: number) => {
    setContenedores((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!proveedor || !lote || !fechaVencimiento || !amonetMateriaPrimaId) {
      toast({ title: 'Error', description: 'Completa todos los campos requeridos', variant: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        fecha_ingreso: fechaIngreso,
        amonet_materia_prima_id: amonetMateriaPrimaId,
        proveedor,
        lote,
        fecha_vencimiento: fechaVencimiento,
        contenedores: contenedores.map((c, i) => ({
          contador: i + 1,
          cantidad: c.cantidad,
          cantidad_disponible: c.cantidad_disponible,
          precio: c.precio,
        })),
      };

      if (archivo) {
        await inventarioApi.updateInventarioWithFile(params.id as string, payload, archivo);
      } else {
        await inventarioApi.updateInventario(params.id as string, payload);
      }
      toast({ title: 'Inventario actualizado', description: 'El inventario se ha actualizado correctamente', variant: 'success' });
      router.push('/inventario');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al actualizar'), variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!inventario) return null;

  return (
    <>
      <PageHeader title="Editar inventario" description={`Modifica los datos del ingreso ${inventario.numero_ingreso}`} />
      <div className="px-6 py-4 max-w-4xl space-y-6">
        <div className="rounded-8 border border-border-tabla bg-white p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha de ingreso</label>
              <Input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Materia prima</label>
              <select
                className="flex h-10 w-full rounded-8 border border-input bg-white px-3 py-2 text-sm"
                value={amonetMateriaPrimaId}
                onChange={(e) => setAmonetMateriaPrimaId(e.target.value)}
              >
                <option value="">Seleccionar</option>
                {materiasPrimas.map((mp) => (
                  <option key={mp.id} value={mp.id}>{mp.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Proveedor</label>
              <Input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Proveedor" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Lote</label>
              <Input value={lote} onChange={(e) => setLote(e.target.value)} placeholder="N° de lote" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha de vencimiento</label>
              <Input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gris-tecnico">Contenedores</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addContenedor}>
                <Plus className="h-3 w-3 mr-1" /> Agregar
              </Button>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-gris-tecnico mb-1">
              <span className="w-6" />
              <span className="w-24">Cant. original {inventario.unidad_abreviacion && `(${inventario.unidad_abreviacion})`}</span>
              <span className="w-24">Cant. disponible {inventario.unidad_abreviacion && `(${inventario.unidad_abreviacion})`}</span>
              <span className="w-24">Precio ($)</span>
              <span className="w-8" />
            </div>
            {contenedores.map((c, idx) => (
              <div key={idx} className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gris-tecnico w-6">{idx + 1}.</span>
                <Input
                  type="number"
                  min={0}
                  value={c.cantidad}
                  onChange={(e) => updateContenedor(idx, 'cantidad', Number(e.target.value))}
                  className="w-24"
                />
                <Input
                  type="number"
                  min={0}
                  value={c.cantidad_disponible}
                  onChange={(e) => updateContenedor(idx, 'cantidad_disponible', Number(e.target.value))}
                  className="w-24"
                />
                <Input
                  type="number"
                  min={0}
                  value={c.precio}
                  onChange={(e) => updateContenedor(idx, 'precio', Number(e.target.value))}
                  className="w-24"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeContenedor(idx)}>
                  <Trash2 className="h-3 w-3 text-coral-alerta" />
                </Button>
              </div>
            ))}
            {contenedores.length === 0 && (
              <p className="text-xs text-gris-tecnico mt-1">Agrega al menos un contenedor</p>
            )}
          </div>
        </div>

        <div className="rounded-8 border border-border-tabla bg-white p-4">
          <label className="block text-xs font-medium text-gris-tecnico mb-2">Evidencia (dejar vacío para mantener la actual)</label>
          <Input
            type="file"
            accept=".zip,.tar,.gz,.rar,.7z,.bz2,.xz,.zst"
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          />
          {archivo && <p className="text-xs text-gris-tecnico mt-1">Nuevo: {archivo.name}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => router.push('/inventario')}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </>
  );
}
