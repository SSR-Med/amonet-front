'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useProductStore, useBrandStore, useRawMaterialStore, useProductVariableStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { validateFormula } from '@/lib/formula-validator';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getById } = useProductStore();
  const { getById: getBrandById } = useBrandStore();
  const { getById: getMaterialById } = useRawMaterialStore();
  const { getAll: getAllVariables } = useProductVariableStore();

  const product = getById(params.id as string);

  if (!product) {
    router.push('/products');
    return null;
  }

  const brand = getBrandById(product.brandId);
  const variables = getAllVariables();

  return (
    <div className="px-6 py-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/products')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-medium text-gray-900">{product.name}</h1>
            <p className="text-sm text-gris-tecnico">Código: {product.code}</p>
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
              <p className="text-sm text-gray-900">{brand?.name || 'Sin marca'}</p>
            </div>
            <div>
              <p className="text-xs text-gris-tecnico">Total Materias Primas</p>
              <p className="text-sm text-gray-900">{product.rawMaterials.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-8 border border-border-tabla bg-white p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Materias Primas</h3>
          <div className="space-y-3">
            {product.rawMaterials.map((pm, index) => {
              const material = getMaterialById(pm.rawMaterialId);
              const validation = validateFormula(pm.formula, variables.map((v) => v.name));

              return (
                <div key={index} className="flex items-center justify-between p-3 border border-border-tabla rounded-8">
                  <div className="flex items-center gap-3">
                    {material && (
                      <Badge variant={material.type === 'chemical' ? 'chemical' : 'packaging'}>
                        {material.type === 'chemical' ? '● Químico' : '● Empaquetado'}
                      </Badge>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{material?.name || 'Materia prima no encontrada'}</p>
                      <p className="text-xs text-gris-tecnico">{material?.name || pm.rawMaterialId}</p>
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
