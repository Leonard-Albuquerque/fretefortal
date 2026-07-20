import AdminSidebar from '@/components/AdminSidebar';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Cobertura085 Admin - Painel de Controle',
  description: 'Gerenciamento de taxas de frete por bairro em Fortaleza',
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug: storeSlug }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-[#FFFDFB] text-slate-800 transition-colors animate-fadeIn">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-[#F1ECE6] bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-10 flex-shrink-0 transition-colors shadow-sm shadow-slate-900/5">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Painel Admin
            </h2>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-medium text-slate-500">
              {store.name}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1] px-2.5 py-1 rounded-full shadow-xs">
              Fortaleza - CE
            </span>
          </div>
        </header>
        <div className="flex-1 px-8 pt-8 pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
