import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Sidebar } from '@/components/layout/sidebar';
import { HydrationGate } from '@/components/hydration-gate';
import './globals.css';

export const metadata: Metadata = {
  title: 'Amonet - Sistema de Gestión de Productos',
  description: 'Aplicación para la gestión de productos cosméticos, marcas, materias primas y variables de fórmula',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-60 flex-1">
              <HydrationGate>{children}</HydrationGate>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}