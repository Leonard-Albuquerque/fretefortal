import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import QRCodeDownloadCard from '@/components/QRCodeDownloadCard';
import { Wrench, Sparkles, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function ResourcesPage({ params }: PageProps) {
  const { storeSlug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      qrToken: true,
    }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className=" mx-auto space-y-6 py-2 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#2E5B9A]" />
            Recursos do Empreendedor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ferramentas e utilitários exclusivos para ajudar a divulgar e gerenciar a sua loja.
          </p>
        </div>
      </div>

      {/* Resource Section 1: QR Code */}
      <QRCodeDownloadCard
        storeName={store.name}
        storeSlug={store.slug}
        qrToken={store.qrToken}
      />

      {/* Future Resources Placeholder Section */}
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center bg-slate-50/50 space-y-2">
        <div className="inline-flex p-2.5 bg-white rounded-full border border-slate-200/80 text-slate-400 shadow-2xs">
          <Layers className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Novos Recursos em Breve</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Estamos preparando novos materiais de divulgação e utilitários para acelerar o seu negócio.
        </p>
      </div>
    </div>
  );
}
