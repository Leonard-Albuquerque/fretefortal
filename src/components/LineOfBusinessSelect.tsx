'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Briefcase, PlusCircle, AlertCircle } from 'lucide-react';

export interface LineOfBusinessItem {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

interface LineOfBusinessSelectProps {
  value: string | null;
  customValue: string | null;
  onChange: (code: string | null, customText: string | null) => void;
}

export default function LineOfBusinessSelect({
  value,
  customValue,
  onChange,
}: LineOfBusinessSelectProps) {
  const [items, setItems] = useState<LineOfBusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch from API GET /line-of-businesses
  useEffect(() => {
    let isMounted = true;
    async function fetchLinesOfBusiness() {
      try {
        setLoading(true);
        const res = await fetch('/line-of-businesses');
        if (!res.ok) {
          throw new Error('Falha ao carregar ramos de atuação');
        }
        const data = await res.json();
        if (isMounted) {
          setItems(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading lines of business:', err);
        if (isMounted) {
          setError('Não foi possível carregar as categorias da API.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLinesOfBusiness();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Combine items with "Outro" at the very end
  const allOptions: Array<{ code: string; name: string; isOther?: boolean }> = [
    ...items.map((item) => ({ code: item.code, name: item.name })),
    { code: 'other', name: 'Outro (Especifique...)', isOther: true },
  ];

  // Filter options based on query
  const filteredOptions = allOptions.filter((opt) =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selected item display text
  const selectedOption = allOptions.find((opt) => opt.code === value);
  const displayLabel = selectedOption
    ? (selectedOption.code === 'other' ? 'Outro' : selectedOption.name)
    : 'Selecione o ramo de atuação...';

  const handleSelectOption = (code: string) => {
    if (code === 'other') {
      onChange('other', customValue || '');
    } else {
      onChange(code, null);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
        Ramo de Atuação (Segmento)
      </label>

      {/* Select Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 text-xs font-medium flex items-center justify-between transition-all cursor-pointer shadow-xs ${
            isOpen ? 'border-[#0D9488] ring-2 ring-[#0D9488]/20' : 'border-[#EAE4DC] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center space-x-2.5 truncate">
            <Briefcase className="h-4 w-4 text-[#0D9488] flex-shrink-0" />
            <span className={value ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}>
              {displayLabel}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#0D9488]' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1.5 w-full bg-white border border-[#EAE4DC] rounded-xl shadow-xl overflow-hidden animate-fadeIn">
            {/* Search Input */}
            <div className="p-2 border-b border-[#F1ECE6] bg-slate-50">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar categoria..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#EAE4DC] bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>
            </div>

            {/* List items */}
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium animate-pulse">
                  Carregando categorias da API...
                </div>
              ) : error ? (
                <div className="p-3 text-center text-xs text-rose-600 font-medium flex items-center justify-center space-x-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{error}</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  Nenhuma categoria encontrada.
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = value === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => handleSelectOption(opt.code)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0FDFA] text-[#0D9488] font-bold border border-[#CCFBF1]'
                          : opt.isOther
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border-t border-slate-200 mt-1'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {opt.isOther ? (
                          <PlusCircle className="h-3.5 w-3.5 text-[#FF8A65]" />
                        ) : null}
                        <span className="truncate">{opt.name}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#0D9488] flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Conditional Custom Input for "Outro" */}
      {value === 'other' && (
        <div className="p-4 bg-[#FFFDFB] border border-[#FFDCD2] rounded-xl space-y-2 animate-fadeIn">
          <label className="text-[10px] font-extrabold text-[#FF8A65] uppercase tracking-wider block flex items-center space-x-1.5">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Especifique o Ramo de Atuação da Sua Loja</span>
          </label>
          <input
            type="text"
            required
            value={customValue || ''}
            onChange={(e) => onChange('other', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8A65] text-xs font-medium"
            placeholder="Ex.: Loja de Miniaturas, Colecionáveis e Jogos de Tabuleiro"
          />
          <p className="text-[10px] text-slate-400 font-medium">
            Seu ramo personalizado ficará armazenado e poderá ser promovido a uma categoria oficial futuramente.
          </p>
        </div>
      )}
    </div>
  );
}
