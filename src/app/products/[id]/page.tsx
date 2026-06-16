'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { validateFormula } from '@/lib/formula-validator';
import { useProductVariableStore } from '@/stores';
import * as productsApi from '@/lib/api/products';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { items: variables, getAll: getAllVariables } = useProductVariableStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (variables.length === 0) getAllVariables();
  }, [variables.length, getAllVariables]);

  useEffect(() => {
    (async () => {
      try {
        const data = await productsApi.getProductById(params.id as string);
        setProduct(data);
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
        router.push('/products');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, toast]);

  if (loading) return null;
  if (!product) return null;

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
        {isAdmin && (
          <Button asChild>
            <Link href={`/products/${product.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        )}
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
              const validation = validateFormula(pm.formula, variables.map((v) => v.nombre));

              return (
                <div key={index} className="flex items-center justify-between p-3 border border-border-tabla rounded-8">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-violet-lab" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pm.nombre}</p>
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
