'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { evaluate } from 'mathjs';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { useProductStore, useRawMaterialStore, useProductVariableStore } from '@/stores';
import { createOrdenProduccion } from '@/lib/api/ordenes-produccion';
import * as inventarioApi from '@/lib/api/inventario';
import type { Product, RawMaterial, ContenedorItem, ProductVariable, InventarioItem } from '@/types';
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, Sparkles, Package, FlaskConical } from 'lucide-react';

type WizardStep = 1 | 2 | 3 | 4;

interface MaterialSelection {
  tempId: number;
  materia_prima_id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
}

interface ContainerSelection {
  contenedor: ContenedorItem;
  cantidad: number;
  lote: string;
  proveedor: string;
}

interface AvailablePageState {
  items: InventarioItem[];
  page: number;
  totalItems: number;
  loteSearch: string;
}

export default function NewOrdenProduccionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const { getAll: getAllProducts, items: products } = useProductStore();
  const { getAll: getAllMaterials, items: rawMaterials, loadCatalogs } = useRawMaterialStore();
  const { getAll: getAllVariables, items: variables } = useProductVariableStore();

  const [step, setStep] = useState<WizardStep>(1);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const [variableValues, setVariableValues] = useState<Record<string, number>>({});
  const [calculatedMaterials, setCalculatedMaterials] = useState<MaterialSelection[]>([]);
  const [freeEditMaterials, setFreeEditMaterials] = useState<MaterialSelection[]>([]);
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [freeEditNotes, setFreeEditNotes] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [selectedContainersMap, setSelectedContainersMap] = useState<Record<string, ContainerSelection[]>>({});
  const [availablePages, setAvailablePages] = useState<Record<string, AvailablePageState>>({});
  const [loadingContainers, setLoadingContainers] = useState(false);

  useEffect(() => {
    getAllProducts(1, 100);
    getAllMaterials(1, 100);
    getAllVariables();
    loadCatalogs();
  }, [getAllProducts, getAllMaterials, getAllVariables, loadCatalogs]);

  useEffect(() => {
    if (!isAdmin) router.push('/');
  }, [isAdmin, router]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      p => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const selectedProduct = useMemo(
    () => products.find(p => p.id === selectedProductId) || null,
    [products, selectedProductId],
  );

  const productVariables = useMemo(() => {
    if (!selectedProduct) return [];
    const varSet = new Set<string>();
    for (const mp of selectedProduct.materias_primas) {
      try {
        const node = evaluate(mp.formula.replace(/([a-zA-Z_]\w*)/g, (m) => {
          if (!isNaN(Number(m))) return m;
          if (m === 'true' || m === 'false') return m;
          return `scope["${m}"]`;
        }));
      } catch {
        const matches = mp.formula.match(/[a-zA-Z_]\w*/g);
        if (matches) matches.forEach(v => varSet.add(v));
      }
    }
    return Array.from(varSet).sort();
  }, [selectedProduct]);

  const handleSelectProduct = useCallback((id: string) => {
    setSelectedProductId(id);
    setVariableValues({});
    setCalculatedMaterials([]);
    setFreeEditMaterials([]);
    setIsFreeMode(false);
    setFreeEditNotes('');
  }, []);

  const handleCalculate = useCallback(() => {
    if (!selectedProduct) return;
    const scope = { ...variableValues };
    const vars = productVariables;
    for (const v of vars) {
      if (scope[v] === undefined || isNaN(scope[v])) {
        toast({ title: 'Error', description: `Completa el valor de "${v}"`, variant: 'error' });
        return;
      }
    }
    const results: MaterialSelection[] = [];
    let tempId = 0;
    for (const mp of selectedProduct.materias_primas) {
      let formula = mp.formula;
      for (const [k, v] of Object.entries(scope)) {
        formula = formula.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v));
      }
      try {
        const exact = evaluate(formula);
        const floored = Math.floor(exact);
        const qty = floored > 0 ? floored : Math.ceil(exact);
        const rm = rawMaterials.find(r => r.id === mp.id);
        results.push({
          tempId: tempId++,
          materia_prima_id: mp.id,
          nombre: mp.nombre,
          cantidad: qty,
          unidad: rm?.tipo_unidad?.abreviacion || '',
        });
      } catch {
        results.push({
          tempId: tempId++,
          materia_prima_id: mp.id,
          nombre: mp.nombre,
          cantidad: 0,
          unidad: '',
        });
      }
    }
    setCalculatedMaterials(results);
    toast({ title: 'Cálculo realizado', variant: 'success' });
  }, [selectedProduct, variableValues, productVariables, rawMaterials, toast]);

  const pageSize = 5;

  const fetchAvailablePage = useCallback(
    async (matMpId: string, pageNum: number, loteSearch: string) => {
      const res = await inventarioApi.getAllInventario(pageNum, pageSize, {
        amonet_materia_prima_id: matMpId,
        status: true,
        lote: loteSearch || undefined,
      });
      return res;
    },
    [],
  );

  const handleGoToStep4 = useCallback(async () => {
    setLoadingContainers(true);
    try {
      const materials = isFreeMode ? freeEditMaterials : calculatedMaterials;
      const initialSelected: Record<string, ContainerSelection[]> = {};
      const initialAvailable: Record<string, AvailablePageState> = {};

      for (const mat of materials) {
        if (!mat.materia_prima_id || mat.cantidad <= 0) continue;
        initialSelected[mat.materia_prima_id] = [];
        const res = await fetchAvailablePage(mat.materia_prima_id, 1, '');
        initialAvailable[mat.materia_prima_id] = {
          items: res.items,
          page: 1,
          totalItems: res.total_items,
          loteSearch: '',
        };
      }
      setSelectedContainersMap(initialSelected);
      setAvailablePages(initialAvailable);
      setStep(4);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setLoadingContainers(false);
    }
  }, [isFreeMode, freeEditMaterials, calculatedMaterials, fetchAvailablePage, toast]);

  const handleAddContainer = useCallback(
    async (matMpId: string, inv: InventarioItem, cont: ContenedorItem) => {
      setSelectedContainersMap(prev => ({
        ...prev,
        [matMpId]: [
          ...(prev[matMpId] || []),
          { contenedor: cont, cantidad: 0, lote: inv.lote || '', proveedor: inv.proveedor || '' },
        ],
      }));
    },
    [],
  );

  const handleRemoveContainer = useCallback((matMpId: string, contId: string) => {
    setSelectedContainersMap(prev => ({
      ...prev,
      [matMpId]: (prev[matMpId] || []).filter(c => c.contenedor.id !== contId),
    }));
  }, []);

  const handleSelectedAmountChange = useCallback(
    (matMpId: string, contId: string, cantidad: number) => {
      setSelectedContainersMap(prev => {
        const list = [...(prev[matMpId] || [])];
        const idx = list.findIndex(c => c.contenedor.id === contId);
        if (idx !== -1) {
          const max = list[idx].contenedor.cantidad_disponible;
          list[idx] = { ...list[idx], cantidad: Math.min(cantidad, max) };
        }
        return { ...prev, [matMpId]: list };
      });
    },
    [],
  );

  const handleLoteSearchChange = useCallback(
    async (matMpId: string, loteSearch: string) => {
      const res = await fetchAvailablePage(matMpId, 1, loteSearch);
      setAvailablePages(prev => ({
        ...prev,
        [matMpId]: { items: res.items, page: 1, totalItems: res.total_items, loteSearch },
      }));
    },
    [fetchAvailablePage],
  );

  const handleAvailablePageChange = useCallback(
    async (matMpId: string, newPage: number) => {
      const state = availablePages[matMpId];
      if (!state) return;
      const res = await fetchAvailablePage(matMpId, newPage, state.loteSearch);
      setAvailablePages(prev => ({
        ...prev,
        [matMpId]: { ...prev[matMpId], items: res.items, page: newPage, totalItems: res.total_items },
      }));
    },
    [availablePages, fetchAvailablePage],
  );

  const handleFinalize = useCallback(async () => {
    setSubmitting(true);
    try {
      const materials = isFreeMode ? freeEditMaterials : calculatedMaterials;
      const payload = {
        descripcion: descripcion || `${selectedProduct?.nombre || ''}`,
        amonet_producto_id: selectedProductId!,
        variables_globales: Object.entries(variableValues).map(([nombre, cantidad]) => {
          const v = variables.find(v => v.nombre === nombre);
          return { amonet_variable_materia_prima_id: v?.id || '', cantidad };
        }).filter(v => v.amonet_variable_materia_prima_id),
        materias_primas: materials.map(mat => ({
          amonet_materia_prima_id: mat.materia_prima_id,
          cantidad: mat.cantidad,
          contenedores: (selectedContainersMap[mat.materia_prima_id] || [])
            .filter(c => c.cantidad > 0)
            .map(c => ({
              amonet_inventario_materia_prima_contenedor_id: c.contenedor.id,
              cantidad: c.cantidad,
            })),
        })).filter(mp => mp.contenedores.length > 0),
        observaciones: observaciones || undefined,
      };
      await createOrdenProduccion(payload);
      toast({ title: 'Orden creada exitosamente', variant: 'success' });
      router.push('/ordenes-produccion');
    } catch (err) {
      toast({ title: 'Error al crear orden', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [selectedProductId, selectedProduct, descripcion, observaciones, variableValues, variables, isFreeMode, freeEditMaterials, calculatedMaterials, selectedContainersMap, router, toast]);

  if (!isAdmin) return null;

  const steps = [
    { num: 1, label: 'Producto' },
    { num: 2, label: 'Materiales' },
    { num: 3, label: 'Confirmar' },
    { num: 4, label: 'Contenedores' },
  ];

  const getStepStatus = (s: number) => {
    if (s === step) return 'active';
    if (s < step) return 'completed';
    return 'pending';
  };

  return (
    <>
      <PageHeader
        title="Nueva Orden de Producción"
        description="Sigue los pasos para crear una orden de producción"
      />

      <div className="border-b border-border-tabla bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-0 px-6 py-4">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    getStepStatus(s.num) === 'active'
                      ? 'bg-violet-lab text-white'
                      : getStepStatus(s.num) === 'completed'
                        ? 'bg-green-600 text-white'
                        : 'border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {getStepStatus(s.num) === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    getStepStatus(s.num) === 'active'
                      ? 'text-violet-lab'
                      : getStepStatus(s.num) === 'completed'
                        ? 'text-green-600'
                        : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-3 h-0.5 flex-1 ${
                    s.num < step ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6">
        {step === 1 && (
          <div>
            <h2 className="mb-1 text-base font-semibold">Seleccionar Producto</h2>
            <p className="mb-4 text-sm text-gris-tecnico">
              Elige el producto para el cual se generará la orden de producción.
            </p>
            <div className="mb-4 max-w-sm">
              <Label>Buscar producto</Label>
              <Input
                placeholder="Nombre o código..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
              />
            </div>
            {filteredProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-gris-tecnico">No se encontraron productos.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(p => (
                  <Card
                    key={p.id}
                    className={`cursor-pointer transition-all hover:border-violet-lab ${
                      selectedProductId === p.id
                        ? 'border-2 border-violet-lab bg-lila-50'
                        : ''
                    }`}
                    onClick={() => handleSelectProduct(p.id)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">{p.nombre}</CardTitle>
                      <CardDescription>{p.codigo}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      <p className="text-xs text-violet-lab">{p.marca.nombre}</p>
                      <p className="mt-1 text-xs text-gris-tecnico">
                        {p.materias_primas.length} materia(s) prima(s)
                      </p>
                      {selectedProductId === p.id && (
                        <Badge className="mt-2 bg-green-600">Seleccionado</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="mt-6 flex items-center justify-between border-t border-border-tabla pt-4">
              <Button variant="ghost" onClick={() => router.push('/ordenes-produccion')}>
                Cancelar
              </Button>
              <Button disabled={!selectedProductId} onClick={() => setStep(2)}>
                Siguiente <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="mb-1 text-base font-semibold">Definir Materias Primas</h2>
            <p className="mb-4 text-sm text-gris-tecnico">
              Elige cómo definir las materias primas para esta orden.
            </p>

            {selectedProduct && (
              <div className="mb-4 rounded-lg border border-lila-100 bg-lila-50 px-4 py-3 text-sm">
                <strong>Producto seleccionado:</strong> {selectedProduct.nombre} ({selectedProduct.codigo})
              </div>
            )}

            <div className="mb-4 inline-flex overflow-hidden rounded-lg border border-border-tabla">
              <Button
                variant={isFreeMode ? 'ghost' : 'default'}
                className="rounded-none"
                onClick={() => setIsFreeMode(false)}
              >
                <Sparkles className="mr-1 h-4 w-4" /> Cálculo por fórmulas
              </Button>
              <Button
                variant={isFreeMode ? 'default' : 'ghost'}
                className="rounded-none"
                onClick={() => setIsFreeMode(true)}
              >
                <Package className="mr-1 h-4 w-4" /> Edición libre
              </Button>
            </div>

            {!isFreeMode && (
              <div>
                {productVariables.length === 0 ? (
                  <p className="text-sm text-gris-tecnico">
                    Este producto no requiere variables globales.
                  </p>
                ) : (
                  <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {productVariables.map(v => (
                      <Card key={v}>
                        <CardHeader className="p-4">
                          <CardTitle className="text-xs font-medium text-gray-700">{v}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                          <Input
                            type="number"
                            step="any"
                            placeholder="Valor..."
                            value={variableValues[v] ?? ''}
                            onChange={e =>
                              setVariableValues(prev => ({
                                ...prev,
                                [v]: Number(e.target.value),
                              }))
                            }
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Button onClick={handleCalculate} className="mb-4">
                  <Sparkles className="mr-1 h-4 w-4" /> Calcular
                </Button>

                {calculatedMaterials.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-border-tabla bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-lavanda-soft">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gris-tecnico">Materia Prima</th>
                          <th className="px-4 py-2 text-right font-medium text-gris-tecnico">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculatedMaterials.map(m => (
                          <tr key={m.tempId} className="border-t border-border-tabla">
                            <td className="px-4 py-2">{m.nombre}</td>
                            <td className="px-4 py-2 text-right font-semibold">
                              {m.cantidad.toFixed(2)} {m.unidad}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {isFreeMode && (
              <div>
                <div className="space-y-3" id="freeEditRows">
                  {freeEditMaterials.map((mat, idx) => (
                    <div
                      key={mat.tempId}
                      className="flex items-center gap-3 rounded-lg border border-border-tabla bg-white p-3"
                    >
                      <select
                        className="flex h-9 flex-1 rounded-lg border border-border-tabla bg-white px-3 text-sm"
                        value={mat.materia_prima_id}
                        onChange={e => {
                          const rm = rawMaterials.find(r => r.id === e.target.value);
                          setFreeEditMaterials(prev =>
                            prev.map((m, i) =>
                              i === idx
                                ? {
                                    ...m,
                                    materia_prima_id: e.target.value,
                                    nombre: rm?.nombre || '',
                                    unidad: rm?.tipo_unidad?.abreviacion || '',
                                  }
                                : m,
                            ),
                          );
                        }}
                      >
                        <option value="">Seleccionar materia prima</option>
                        {rawMaterials.map(rm => (
                          <option key={rm.id} value={rm.id}>
                            {rm.nombre} ({rm.tipo_unidad?.abreviacion || ''})
                          </option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        className="w-28"
                        placeholder="Cantidad"
                        value={mat.cantidad || ''}
                        onChange={e =>
                          setFreeEditMaterials(prev =>
                            prev.map((m, i) =>
                              i === idx ? { ...m, cantidad: Number(e.target.value) || 0 } : m,
                            ),
                          )
                        }
                      />
                      <span className="min-w-[30px] text-xs text-gris-tecnico">{mat.unidad}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setFreeEditMaterials(prev => prev.filter((_, i) => i !== idx))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setFreeEditMaterials(prev => [
                      ...prev,
                      { tempId: Date.now(), materia_prima_id: '', nombre: '', cantidad: 0, unidad: '' },
                    ]);
                  }}
                >
                  <Plus className="mr-1 h-4 w-4" /> Agregar materia prima
                </Button>
                <div className="mt-4">
                  <Label>Notas / Justificación</Label>
                  <textarea
                    className="mt-1 min-h-[80px] w-full resize-y rounded-lg border border-border-tabla bg-white p-3 text-sm outline-none focus:border-2 focus:border-violet-lab"
                    placeholder="Explica por qué utilizas estas materias primas..."
                    value={freeEditNotes}
                    onChange={e => setFreeEditNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-border-tabla pt-4">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
              </Button>
              <Button
                disabled={
                  isFreeMode
                    ? !freeEditMaterials.some(m => m.materia_prima_id && m.cantidad > 0)
                    : calculatedMaterials.length === 0
                }
                onClick={() => setStep(3)}
              >
                Siguiente <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-1 text-base font-semibold">Confirmar Orden</h2>
            <p className="mb-4 text-sm text-gris-tecnico">Revisa el resumen de la orden de producción.</p>

            <div className="mb-4">
              <Label>Descripción</Label>
              <Input
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Descripción de la orden"
              />
            </div>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm">Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-gris-tecnico">Nombre</span>
                  <span className="font-medium">{selectedProduct?.nombre || '-'}</span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-gris-tecnico">Código</span>
                  <span className="font-medium">{selectedProduct?.codigo || '-'}</span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-gris-tecnico">Marca</span>
                  <span className="font-medium">{selectedProduct?.marca?.nombre || '-'}</span>
                </div>
              </CardContent>
            </Card>

            {!isFreeMode && Object.keys(variableValues).length > 0 && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm">Variables Globales</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(variableValues).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 text-sm">
                      <span className="text-gris-tecnico">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm">Materias Primas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden rounded-lg border border-border-tabla bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-lavanda-soft">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gris-tecnico">Materia Prima</th>
                        <th className="px-4 py-2 text-right font-medium text-gris-tecnico">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(isFreeMode ? freeEditMaterials : calculatedMaterials).map((m, i) => (
                        <tr key={m.tempId || i} className="border-t border-border-tabla">
                          <td className="px-4 py-2">{m.nombre}</td>
                          <td className="px-4 py-2 text-right font-semibold">
                            {m.cantidad.toFixed(2)} {m.unidad}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="mb-4">
              <Label>Observaciones</Label>
              <textarea
                className="mt-1 min-h-[80px] w-full resize-y rounded-lg border border-border-tabla bg-white p-3 text-sm outline-none focus:border-2 focus:border-violet-lab"
                placeholder="Observaciones adicionales..."
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
              />
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border-tabla pt-4">
              <Button variant="secondary" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
              </Button>
              <Button onClick={handleGoToStep4} disabled={loadingContainers}>
                {loadingContainers ? 'Cargando...' : 'Continuar a Contenedores'}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="mb-1 text-base font-semibold">Seleccionar Contenedores</h2>
            <p className="mb-4 text-sm text-gris-tecnico">
              Agrega contenedores desde el panel derecho y ajusta las cantidades en el panel izquierdo.
            </p>

            {(isFreeMode ? freeEditMaterials : calculatedMaterials).map(mat => {
              if (!mat.materia_prima_id || mat.cantidad <= 0) return null;
              const selected = selectedContainersMap[mat.materia_prima_id] || [];
              const selectedIds = new Set(selected.map(c => c.contenedor.id));
              const available = availablePages[mat.materia_prima_id];
              const totalSelected = selected.reduce((s, c) => s + c.cantidad, 0);
              const remaining = mat.cantidad - totalSelected;

              return (
                <Card key={mat.materia_prima_id} className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-sm">{mat.nombre}</CardTitle>
                    <CardDescription>
                      Necesario: <strong>{mat.cantidad.toFixed(2)} {mat.unidad}</strong>
                      {' | '}Seleccionado: <strong className={totalSelected >= mat.cantidad ? 'text-green-600' : 'text-coral-alerta'}>{totalSelected.toFixed(2)}</strong>
                      {' | '}Restante: <strong>{remaining.toFixed(2)}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selected.length === 0 && !available ? (
                      <p className="text-sm text-coral-alerta">No hay contenedores disponibles para esta materia prima.</p>
                    ) : (
                      <div className="flex gap-4">
                        <div className="w-1/2 space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-gris-tecnico">Seleccionados</h4>
                          {selected.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gris-tecnico">Ningún contenedor seleccionado</p>
                          ) : (
                            selected.map(sel => (
                              <div key={sel.contenedor.id} className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    Lote {sel.lote} <span className="text-gris-tecnico">#{sel.contenedor.contador}</span>
                                  </p>
                                  <p className="text-[10px] text-gris-tecnico">{sel.proveedor}</p>
                                </div>
                                <Input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max={sel.contenedor.cantidad_disponible}
                                  className="w-20 h-7 text-right text-xs"
                                  value={sel.cantidad || ''}
                                  placeholder="0"
                                  onChange={e =>
                                    handleSelectedAmountChange(mat.materia_prima_id, sel.contenedor.id, Number(e.target.value) || 0)
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0"
                                  onClick={() => handleRemoveContainer(mat.materia_prima_id, sel.contenedor.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="w-1/2 space-y-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-gris-tecnico">Disponibles</h4>
                          <Input
                            placeholder="Buscar por lote..."
                            className="h-8 text-xs"
                            value={available?.loteSearch || ''}
                            onChange={e => handleLoteSearchChange(mat.materia_prima_id, e.target.value)}
                          />
                          {!available ? (
                            <p className="py-4 text-center text-sm text-gris-tecnico">Cargando...</p>
                          ) : available.items.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gris-tecnico">No se encontraron contenedores.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {available.items.map(inv =>
                                inv.contenedores
                                  .filter(cont => cont.cantidad_disponible > 0 && !selectedIds.has(cont.id))
                                  .map(cont => (
                                    <div key={cont.id} className="flex items-center gap-2 rounded-lg border border-border-tabla bg-white p-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">
                                          Lote {inv.lote} <span className="text-gris-tecnico">#{cont.contador}</span>
                                        </p>
                                        <p className="text-[10px] text-gris-tecnico">{inv.proveedor} · Disp: {cont.cantidad_disponible.toFixed(2)}</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs shrink-0"
                                        onClick={() => handleAddContainer(mat.materia_prima_id, inv, cont)}
                                      >
                                        Agregar
                                      </Button>
                                    </div>
                                  )),
                              )}
                            </div>
                          )}
                          {available && available.totalItems > pageSize && (
                            <div className="flex items-center justify-center gap-2 pt-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 text-xs"
                                disabled={available.page <= 1}
                                onClick={() => handleAvailablePageChange(mat.materia_prima_id, available.page - 1)}
                              >
                                Anterior
                              </Button>
                              <span className="text-xs text-gris-tecnico">
                                {available.page} / {Math.ceil(available.totalItems / pageSize)}
                              </span>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 text-xs"
                                disabled={available.page >= Math.ceil(available.totalItems / pageSize)}
                                onClick={() => handleAvailablePageChange(mat.materia_prima_id, available.page + 1)}
                              >
                                Siguiente
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            <div className="mt-6 flex items-center justify-between border-t border-border-tabla pt-4">
              <Button variant="secondary" onClick={() => setStep(3)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
              </Button>
              <Button onClick={handleFinalize} disabled={submitting}>
                {submitting ? 'Creando...' : 'Finalizar Orden'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
