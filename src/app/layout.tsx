import type { Metadata } from 'next';
import { AuthProvider } from '@/common/context/AuthContext';
import { AppProviders } from '@/theme/providers';

export const metadata: Metadata = {
  title: 'Sistema de Recaudaciones | Gobierno Autónomo Departamental de La Paz',
  description: 'Plataforma institucional para la gestión y seguimiento de las recaudaciones del Gobierno Autónomo Departamental de La Paz.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>
        <AppProviders>
          <AuthProvider>{children}</AuthProvider>
        </AppProviders>
      </body>
    </html>
  );
}