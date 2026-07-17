import AdminSidebar from '@/components/AdminSidebar';

export const metadata = {
  title: 'FreteFortal Admin - Painel de Controle',
  description: 'Gerenciamento de taxas de frete por bairro em Fortaleza',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Painel Administrativo
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              Fortaleza - CE
            </span>
          </div>
        </header>
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
