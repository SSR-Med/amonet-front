'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { ProductForm } from '@/components/forms';
import * as productsApi from '@/lib/api/products';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { Product } from '@/types';

export default function EditProductPage() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) router.push('/products');
  }, [isAdmin, router]);

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

  if (!isAdmin || loading) return null;
  if (!product) return null;

  return (
    <>
      <PageHeader title="Editar producto" description="Modifica los datos del producto" />
      <div className="px-6 py-4">
        <div className="max-w-2xl">
          <ProductForm
            initialData={{
              codigo: product.codigo,
              nombre: product.nombre,
              id_amonet_marca: product.marca.id,
              materias_primas: product.materias_primas.map((mp) => ({
                id_amonet_materia_prima: mp.id,
                formula: mp.formula,
              })),
            }}
            entityId={product.id}
            mode="edit"
          />
        </div>
      </div>
    </>
  );
}
