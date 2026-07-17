'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Settings, ExternalLink, Motorbike, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
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
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Bairros e Taxas', href: '/admin/neighborhoods', icon: Map },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
  ];

  // Prevent flash of layout shifts by holding initial render until mounted
  const widthClass = !isMounted ? 'w-64' : (isCollapsed ? 'w-20' : 'w-64');

  return (
    <aside className={`${widthClass} bg-slate-900 text-white flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-20 flex-shrink-0`}>
      {/* Sidebar Header with Toggle Button on the Left */}
      <div className={`border-b border-slate-800 flex items-center overflow-hidden transition-all duration-300 ${
        isMounted && isCollapsed ? 'p-4 justify-center' : 'p-6 space-x-3'
      }`}>
        <button
          type="button"
          onClick={handleToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer flex-shrink-0 active:scale-95"
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isMounted && isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
        
        {isMounted && !isCollapsed && (
          <div className="flex items-center space-x-3 overflow-hidden flex-1 animate-fadeIn">
            <div className="bg-emerald-500 p-2 rounded-lg text-slate-900 flex-shrink-0">
              <Motorbike className="h-6 w-6" />
            </div>
            <div className="flex flex-col flex-shrink-0">
              <h1 className="font-bold text-lg leading-none">FreteFortal</h1>
              <span className="text-xs text-emerald-400 font-medium mt-1">Painel Admin</span>
            </div>
          </div>
        )}
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
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isCollapsed ? 'justify-center' : 'space-x-3'
              } ${
                isActive
                  ? 'bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          title={isCollapsed ? "Ver site público" : undefined}
          className={`flex items-center rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all ${
            isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'
          }`}
        >
          <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
            <ExternalLink className="h-5 w-5 flex-shrink-0" />
            {isMounted && !isCollapsed && (
              <span className="animate-fadeIn whitespace-nowrap">Ver site público</span>
            )}
          </div>
        </Link>
      </div>
    </aside>
  );
}
