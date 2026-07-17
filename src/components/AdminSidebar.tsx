'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Settings, ExternalLink, Motorbike } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Bairros e Taxas', href: '/admin/neighborhoods', icon: Map },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="bg-emerald-500 p-2 rounded-lg text-slate-900">
          <Motorbike className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">FreteFortal</h1>
          <span className="text-xs text-emerald-400 font-medium">Painel Admin</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500 text-slate-900'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <div className="flex items-center space-x-3">
            <ExternalLink className="h-5 w-5" />
            <span>Ver site público</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
