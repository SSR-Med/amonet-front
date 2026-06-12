import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { AppShell } from '@/components/layout/app-shell';
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
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
