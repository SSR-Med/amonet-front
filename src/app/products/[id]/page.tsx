'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useProductStore, useRawMaterialStore, useProductVariableStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { validateFormula } from '@/lib/formula-validator';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getById, getAll, items, loading } = useProductStore();
  const { getById: getMaterialById, getAll: getAllMaterials, items: allMaterials } = useRawMaterialStore();
  const { items: variables, getAll: getAllVariables } = useProductVariableStore();

  useEffect(() => {
    if (items.length === 0) getAll();
    if (allMaterials.length === 0) getAllMaterials();
    if (variables.length === 0) getAllVariables();
  }, [items.length, allMaterials.length, variables.length, getAll, getAllMaterials, getAllVariables]);

  const product = getById(params.id as string);

  if (loading && !product) return null;

  if (!product) {
    router.push('/products');
    return null;
  }

  return (
    <div className="px-6 py-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/products')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-medium text-gray-900">{product.nombre}</h1>
            <p className="text-sm text-gris-tecnico">Código: {product.codigo}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/products/${product.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="rounded-8 border border-border-tabla bg-white p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Información General</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gris-tecnico">Marca</p>
              <p className="text-sm text-gray-900">{product.marca.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-gris-tecnico">Total Materias Primas</p>
              <p className="text-sm text-gray-900">{product.materias_primas.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-8 border border-border-tabla bg-white p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Materias Primas</h3>
          <div className="space-y-3">
            {product.materias_primas.map((pm, index) => {
              const material = getMaterialById(pm.id) || allMaterials.find((m) => m.id === pm.id);
              const validation = validateFormula(pm.formula, variables.map((v) => v.nombre));

              return (
                <div key={index} className="flex items-center justify-between p-3 border border-border-tabla rounded-8">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-violet-lab" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pm.nombre}</p>
                      {material && (
                        <p className="text-xs text-gris-tecnico">
                          {material.tipo_materia_prima.nombre} · {material.tipo_unidad.abreviacion}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <code className="text-sm text-violet-lab bg-lila-50 px-2 py-1 rounded">
                      {pm.formula}
                    </code>
                    {!validation.valid && (
                      <p className="text-xs text-coral-alerta mt-1">{validation.error}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
