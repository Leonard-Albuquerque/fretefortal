'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Globe, Store, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PangalaxySidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pangalaxy-sidebar-collapsed');
      if (stored !== null) {
        setIsCollapsed(stored === 'true');
      }
    }
  }, []);

  const handleToggle = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pangalaxy-sidebar-collapsed', String(nextState));
    }
  };

  const menuItems = [
    { name: 'Dashboard Global', href: '/pangalaxyadmin', icon: Activity },
    { name: 'Empresas', href: '/pangalaxyadmin/businesses', icon: Store },
  ];

  const widthClass = !isMounted ? 'w-64' : (isCollapsed ? 'w-20' : 'w-64');

  return (
    <aside className={`${widthClass} bg-white text-slate-800 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-20 flex-shrink-0 border-r border-[#F1ECE6] shadow-sm shadow-slate-900/5`}>
      {/* Sidebar Header */}
      <div className={`border-b border-[#F1ECE6] flex items-center overflow-hidden transition-all duration-300 ${
        isMounted && isCollapsed ? 'p-4 justify-center' : 'p-6 space-x-3'
      }`}>
        {isMounted && !isCollapsed && (
          <div className="flex items-center space-x-3 overflow-hidden flex-1 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] p-2 rounded-lg text-slate-950 flex-shrink-0 shadow-md shadow-[#2E5B9A]/20">
              <Globe className="h-6 w-6" />
            </div>
            <div className="flex flex-col flex-shrink-0">
              <h1 className="font-extrabold text-base leading-none bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] bg-clip-text text-transparent">Pangalaxy</h1>
              <span className="text-[10px] text-[#2E5B9A] font-bold mt-1 tracking-wider uppercase">Telemetria</span>
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isCollapsed ? 'justify-center' : 'space-x-3'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-slate-950 shadow-md shadow-[#2E5B9A]/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200'
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

      {/* External Link */}
      <div className="p-4 border-t border-[#F1ECE6]">
        <Link
          href="/"
          title={isCollapsed ? "Ver site público" : undefined}
          className={`flex items-center rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all ${
            isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3 border border-transparent hover:border-slate-200'
          }`}
        >
          <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
            <ExternalLink className="h-5 w-5 flex-shrink-0 text-slate-400" />
            {isMounted && !isCollapsed && (
              <span className="animate-fadeIn whitespace-nowrap">Site Público</span>
            )}
          </div>
        </Link>
      </div>
    </aside>
  );
}
