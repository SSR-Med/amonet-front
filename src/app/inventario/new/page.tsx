'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { useRawMaterialStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import * as inventarioApi from '@/lib/api/inventario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout';

interface ContenedorRow {
  cantidad: number;
  precio: number;
}

interface ItemRow {
  id: number;
  amonet_materia_prima_id: string;
  proveedor: string;
  lote: string;
  fecha_vencimiento: string;
  contenedores: ContenedorRow[];
}

export default function NewInventarioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items: materiasPrimas, getAll: loadMateriasPrimas } = useRawMaterialStore();
  const [items, setItems] = useState<ItemRow[]>([
    { id: 1, amonet_materia_prima_id: '', proveedor: '', lote: '', fecha_vencimiento: '', contenedores: [] },
  ]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [nextId, setNextId] = useState(2);

  useEffect(() => {
    if (materiasPrimas.length === 0) loadMateriasPrimas();
  }, [materiasPrimas.length, loadMateriasPrimas]);

  const addItem = () => {
    setItems((prev) => [...prev, { id: nextId, amonet_materia_prima_id: '', proveedor: '', lote: '', fecha_vencimiento: '', contenedores: [] }]);
    setNextId((n) => n + 1);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: number, field: keyof Omit<ItemRow, 'id' | 'contenedores'>, value: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const addContenedor = (itemId: number) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, contenedores: [...i.contenedores, { cantidad: 0, precio: 0 }] } : i)));
  };

  const removeContenedor = (itemId: number, index: number) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, contenedores: i.contenedores.filter((_, idx) => idx !== index) } : i)));
  };

  const updateContenedorField = (itemId: number, index: number, field: keyof ContenedorRow, value: number) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, contenedores: i.contenedores.map((c, idx) => (idx === index ? { ...c, [field]: Math.max(0, value) } : c)) } : i)));
  };

  const handleSubmit = async () => {
    if (!archivo) {
      toast({ title: 'Error', description: 'Debes seleccionar un archivo de evidencia', variant: 'error' });
      return;
    }

    const hasEmpty = items.some(
      (i) => !i.amonet_materia_prima_id || !i.proveedor || !i.lote || !i.fecha_vencimiento || i.contenedores.length === 0
    );
    if (hasEmpty) {
      toast({ title: 'Error', description: 'Completa todos los campos requeridos', variant: 'error' });
      return;
    }

    const hasNegative = items.some((i) => i.contenedores.some((c) => c.cantidad < 0 || c.precio < 0));
    if (hasNegative) {
      toast({ title: 'Error', description: 'Las cantidades y precios no pueden ser negativos', variant: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = items.map((i) => ({
        amonet_materia_prima_id: i.amonet_materia_prima_id,
        proveedor: i.proveedor,
        lote: i.lote,
        fecha_vencimiento: i.fecha_vencimiento,
        contenedores: i.contenedores,
      }));
      await inventarioApi.createInventario(payload, archivo);
      toast({ title: 'Inventario creado', description: 'El inventario se ha creado correctamente', variant: 'success' });
      router.push('/inventario');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al crear inventario'), variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Nuevo ingreso de inventario" description="Registra la entrada de materias primas" />
      <div className="px-6 py-4 max-w-4xl space-y-6">
        {items.map((item) => (
          <div key={item.id} className="rounded-8 border border-border-tabla bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Item #{item.id}</span>
              {items.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4 text-coral-alerta" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gris-tecnico mb-1">Materia prima</label>
                <select
                  className="flex h-10 w-full rounded-8 border border-input bg-white px-3 py-2 text-sm"
                  value={item.amonet_materia_prima_id}
                  onChange={(e) => updateItem(item.id, 'amonet_materia_prima_id', e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {materiasPrimas.map((mp) => (
                    <option key={mp.id} value={mp.id}>{mp.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gris-tecnico mb-1">Proveedor</label>
                <Input value={item.proveedor} onChange={(e) => updateItem(item.id, 'proveedor', e.target.value)} placeholder="Proveedor" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gris-tecnico mb-1">Lote</label>
                <Input value={item.lote} onChange={(e) => updateItem(item.id, 'lote', e.target.value)} placeholder="N° de lote" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha de vencimiento</label>
                <Input type="date" value={item.fecha_vencimiento} onChange={(e) => updateItem(item.id, 'fecha_vencimiento', e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gris-tecnico">Contenedores</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addContenedor(item.id)}>
                  <Plus className="h-3 w-3 mr-1" /> Agregar
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gris-tecnico">
                <span className="w-6" />
                <span className="w-28">Cantidad</span>
                <span className="w-28">Precio ($)</span>
                <span className="w-8" />
              </div>
              {item.contenedores.map((cont, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gris-tecnico w-6">{idx + 1}.</span>
                  <Input
                    type="number"
                    min={0}
                    value={cont.cantidad}
                    onChange={(e) => updateContenedorField(item.id, idx, 'cantidad', Number(e.target.value))}
                    className="w-28"
                    placeholder="Cant."
                  />
                  <Input
                    type="number"
                    min={0}
                    value={cont.precio}
                    onChange={(e) => updateContenedorField(item.id, idx, 'precio', Number(e.target.value))}
                    className="w-28"
                    placeholder="Precio"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeContenedor(item.id, idx)}>
                    <Trash2 className="h-3 w-3 text-coral-alerta" />
                  </Button>
                </div>
              ))}
              {item.contenedores.length === 0 && (
                <p className="text-xs text-gris-tecnico mt-1">Agrega al menos un contenedor</p>
              )}
            </div>
          </div>
        ))}

        <Button variant="secondary" onClick={addItem} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Agregar otro item
        </Button>

        <div className="rounded-8 border border-border-tabla bg-white p-4">
          <label className="block text-xs font-medium text-gris-tecnico mb-2">Archivo de evidencia (comprimido)</label>
          <Input
            type="file"
            accept=".zip,.tar,.gz,.rar,.7z,.bz2,.xz,.zst"
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          />
          {archivo && <p className="text-xs text-gris-tecnico mt-1">Seleccionado: {archivo.name}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => router.push('/inventario')}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar ingreso'}
          </Button>
        </div>
      </div>
    </>
  );
}
