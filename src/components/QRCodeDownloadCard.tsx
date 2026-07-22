'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode, ShieldCheck, Printer } from 'lucide-react';

interface QRCodeDownloadCardProps {
  storeName: string;
  storeSlug: string;
  qrToken: string;
}

export default function QRCodeDownloadCard({ storeName, storeSlug, qrToken }: QRCodeDownloadCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const targetUrl = `${origin}/qr/${qrToken}`;
    setQrUrl(targetUrl);

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        targetUrl,
        {
          width: 300,
          margin: 1,
          color: {
            dark: '#1E293B',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          setIsGenerating(false);
          if (error) console.error('Error generating QR code canvas:', error);
        }
      );
    }
  }, [qrToken]);

  const handleCopyLink = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;

    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 1000;
    exportCanvas.width = width;
    exportCanvas.height = height;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(1, '#F8FAFC');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(storeName, width / 2, 110);

    ctx.fillStyle = '#2E5B9A';
    ctx.font = '600 24px sans-serif';
    ctx.fillText('ESCANEIE O QR CODE E ACESSE NOSSA LOJA', width / 2, 160);

    const qrSize = 520;
    const qrX = (width - qrSize) / 2;
    const qrY = 210;
    ctx.drawImage(canvasRef.current, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = '#F1F5F9';
    ctx.roundRect(80, 770, width - 160, 140, 20);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.font = '500 22px sans-serif';
    ctx.fillText('Aponte a câmera do seu celular para ver', width / 2, 825);
    ctx.fillText('nosso catálogo e simular a taxa de entrega!', width / 2, 865);

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Powered by Cobertura085', width / 2, 955);

    const link = document.createElement('a');
    link.download = `qrcode-${storeSlug}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 space-y-4">
      {/* Compact Header inside section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#2E5B9A] to-[#59C8CF] text-white rounded-xl shadow-xs">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight flex items-center gap-2">
              QR Code de Redirecionamento da Loja
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
                <ShieldCheck className="h-3 w-3" /> Não expira
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pensando na sua comodidade, este QR Code é permanente. Mesmo se o link da sua loja mudar no futuro, o QR Code continuará redirecionando para a loja correta.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
        {/* QR Preview (Smaller dimensions: 128x128) */}
        <div className="flex-shrink-0 bg-slate-50 border border-slate-200/70 p-3 rounded-xl flex flex-col items-center">
          <canvas ref={canvasRef} className="w-32 h-32 md:w-36 md:h-36 rounded-lg bg-white p-1 shadow-xs" />
          <span className="text-[11px] text-slate-500 font-mono mt-1.5 font-medium">
            /qr/{qrToken.substring(0, 8)}...
          </span>
        </div>

        {/* Info & Action Controls */}
        <div className="flex-1 space-y-3.5 w-full">
          {/* Direct URL input box */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Link de Redirecionamento Direto
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
              <input
                type="text"
                readOnly
                value={qrUrl || 'Carregando URL...'}
                className="bg-transparent text-slate-700 flex-1 outline-none font-mono text-xs overflow-ellipsis"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-md transition-colors flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2E5B9A] to-[#3B75C4] hover:opacity-95 text-white font-semibold text-xs rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Baixar QR Code para Impressão (PNG)</span>
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
