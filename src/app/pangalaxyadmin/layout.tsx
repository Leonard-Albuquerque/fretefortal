import PangalaxySidebar from '@/components/PangalaxySidebar';

export const metadata = {
  title: 'Telemetria Pangalaxy - Painel de Controle',
  description: 'Painel global de análise de telemetria e logs de busca.',
};

export default function PangalaxyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 transition-colors">
      <PangalaxySidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="flex-1 px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
