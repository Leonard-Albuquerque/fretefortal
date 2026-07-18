'use client';

import { useState, useEffect, useRef } from 'react';
import { searchAddressSuggestions } from '@/app/actions';
import { Search, Loader2, MapPin } from 'lucide-react';

interface Suggestion {
  display_name: string;
  lat: number;
  lon: number;
  bairro?: string;
  road?: string;
}

interface AddressAutocompleteProps {
  placeholder?: string;
  initialValue?: string;
  onSelect: (address: string, lat: number, lon: number, bairro?: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function AddressAutocomplete({
  placeholder = 'Digite o endereço...',
  initialValue = '',
  onSelect,
  className = '',
  disabled = false,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync initialValue when it changes
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Handle outside clicks to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search logic
  useEffect(() => {
    if (inputValue.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Skip suggestion fetch if input matches a selected suggestion (already chosen)
    const exactMatch = suggestions.some((s) => s.display_name === inputValue);
    if (exactMatch) {
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchAddressSuggestions(inputValue);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  const handleSelect = (item: Suggestion) => {
    setInputValue(item.display_name);
    setIsOpen(false);
    onSelect(item.display_name, item.lat, item.lon, item.bairro);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input
          type="text"
          disabled={disabled}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-900 bg-slate-950/40 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5FC9C8] focus:border-transparent transition-all text-sm disabled:opacity-50"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-[#5FC9C8]" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto animate-fadeIn divide-y divide-slate-900/50">
          {suggestions.map((item, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-3 flex items-start space-x-3 text-left hover:bg-slate-900/60 transition-colors cursor-pointer text-xs"
              >
                <MapPin className="h-4 w-4 text-[#5FC9C8] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.display_name}</p>
                  {item.bairro && (
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">
                      Bairro: {item.bairro}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
