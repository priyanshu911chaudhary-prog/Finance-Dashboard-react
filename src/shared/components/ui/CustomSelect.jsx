import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  compact = false,
  className = '',
  menuClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === 'string'
          ? { value: option, label: option }
          : { value: option.value, label: option.label }
      ),
    [options]
  );

  const selected = normalizedOptions.find((option) => option.value === value);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const triggerPadding = compact ? 'px-3 py-1.5 rounded-lg' : 'px-3 py-2.5 rounded-xl';

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`w-full bg-[#121219] border border-white/14 text-white text-sm text-left flex items-center justify-between gap-3 hover:border-white/25 focus:outline-none focus:border-accent focus:ring-2 focus:ring-cyan-400/20 transition-colors ${triggerPadding}`}
      >
        <span className={`truncate ${selected ? 'text-white' : 'text-muted'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-accent transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-2 bg-black border border-white/15 rounded-xl shadow-2xl overflow-hidden z-[9999] ${menuClassName}`}
        >
          <ul className="max-h-72 overflow-y-auto py-1">
            {normalizedOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-sm flex items-center justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-accent/20 text-white' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-accent" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
