'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { LayoutDashboard, Map, Settings, ExternalLink, Motorbike, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const storeSlug = params?.storeSlug as string;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load initial collapsed state from localStorage on client-side mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin-sidebar-collapsed');
      if (stored !== null) {
        setIsCollapsed(stored === 'true');
      }
    }
  }, []);

  const handleToggle = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-sidebar-collapsed', String(nextState));
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: `/${storeSlug}/admin`, icon: LayoutDashboard },
    { name: 'Bairros e Taxas', href: `/${storeSlug}/admin/neighborhoods`, icon: Map },
    { name: 'Configurações', href: `/${storeSlug}/admin/settings`, icon: Settings },
  ];

  const widthClass = !isMounted ? 'w-64' : (isCollapsed ? 'w-20' : 'w-64');

  return (
    <aside className={`hidden md:flex ${widthClass} bg-white text-slate-800 flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-20 flex-shrink-0 border-r border-[#F1ECE6] shadow-xs`}>
      {/* Sidebar Header with Toggle Button on the Left */}
      <div className={`border-b border-[#F1ECE6] flex items-center overflow-hidden transition-all duration-300 ${isMounted && isCollapsed ? 'p-4 justify-center' : 'p-6 space-x-3'
        }`}>

        {isMounted && !isCollapsed && (
          <div className="flex items-center space-x-3 overflow-hidden flex-1 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] p-2 rounded-xl text-white flex-shrink-0 shadow-xs">
              <Motorbike className="h-6 w-6" />
            </div>
            <div className="flex flex-col flex-shrink-0">
              <h1 className="font-bold text-base leading-none text-slate-900">Cobertura085</h1>
              <span className="text-[10px] text-[#2E5B9A] font-bold mt-1 tracking-wider uppercase">Painel Admin</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer flex-shrink-0 active:scale-95 border border-transparent hover:border-slate-200"
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isMounted && isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${isCollapsed ? 'justify-center' : 'space-x-3'
                } ${isActive
                  ? 'bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-slate-950 shadow-md shadow-[#2E5B9A]/20 font-bold'
                  : 'text-slate-600 hover:bg-[#FFFDFB] hover:text-slate-900 border border-transparent hover:border-[#F1ECE6]'
                }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isMounted && !isCollapsed && (
                <span className="animate-fadeIn whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* External Link Section */}
      <div className="p-4 border-t border-[#F1ECE6]">
        <Link
          href={`/${storeSlug}`}
          target="_blank"
          title={isCollapsed ? "Ver site público" : undefined}
          className={`flex items-center rounded-xl text-sm font-medium text-slate-600 hover:bg-[#FFFDFB] hover:text-slate-900 transition-all ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3 border border-transparent hover:border-[#F1ECE6]'
            }`}
        >
          <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
            <ExternalLink className="h-5 w-5 flex-shrink-0 text-[#0D9488]" />
            {isMounted && !isCollapsed && (
              <span className="animate-fadeIn whitespace-nowrap">Ver site público</span>
            )}
          </div>
        </Link>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const params = useParams();
  const storeSlugFromParams = params?.storeSlug as string;
  const segments = pathname ? pathname.split('/').filter(Boolean) : [];
  const storeSlug = storeSlugFromParams || segments[0] || '';

  // Only render on store admin pages
  const isAdminPage = pathname ? /\/[^\/]+\/admin(\/|$)/.test(pathname) : false;
  if (!isAdminPage) {
    return null;
  }

  const mobileItems = [
    { name: 'Dashboard', href: `/${storeSlug}/admin`, icon: LayoutDashboard },
    { name: 'Bairros', href: `/${storeSlug}/admin/neighborhoods`, icon: Map },
    { name: 'Ajustes', href: `/${storeSlug}/admin/settings`, icon: Settings },
    { name: 'Ver Loja', href: `/${storeSlug}`, icon: ExternalLink, external: true },
  ];

  return (
    <nav className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 right-4 max-w-md mx-auto z-50 md:hidden bg-white/95 backdrop-blur-md border border-[#F1ECE6] shadow-xl shadow-slate-900/15 rounded-full px-3 py-2 flex items-center justify-around transition-all">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 group transition-transform duration-200 active:scale-95"
          >
            <Icon
              className={`h-5 w-5 stroke-[1.75] transition-all duration-200 ${
                isActive
                  ? 'text-[#2E5B9A] scale-110'
                  : 'text-slate-400 group-hover:text-slate-600 group-hover:scale-105'
              }`}
            />
            <span
              className={`text-[10px] tracking-tight transition-colors duration-200 mt-1 whitespace-nowrap ${
                isActive
                  ? 'text-[#2E5B9A] font-semibold'
                  : 'text-slate-400 font-medium group-hover:text-slate-600'
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
