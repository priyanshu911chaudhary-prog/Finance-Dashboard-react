import { useSearchParams, useOutletContext } from 'react-router-dom';
import { FilterX } from 'lucide-react';
import { TRANSACTION_CATEGORIES } from '../constants';

const CATEGORIES = ['All', ...TRANSACTION_CATEGORIES];
const TYPES = ['All', 'income', 'expense', 'transfer'];

export function TransactionFilters() {
  // useSearchParams is the React Router equivalent of useState, but it writes to the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSidebarOpen } = useOutletContext?.() || {};
  
  const currentCategory = searchParams.get('category') || 'All';
  const currentType = searchParams.get('type') || 'All';

  const updateFilter = (key, value) => {
    // We clone the existing params so we don't accidentally overwrite other filters
    const newParams = new URLSearchParams(searchParams);
    
    if (value === 'All') {
      newParams.delete(key); // Keep the URL clean if the filter is removed
    } else {
      newParams.set(key, value);
    }
    
    setSearchParams(newParams);
  };

  const hasActiveFilters = currentCategory !== 'All' || currentType !== 'All';

  return (
    <div className="relative z-40 glass-panel p-4 rounded-2xl mb-6 animate-in fade-in grid grid-cols-1 gap-3 md:flex md:flex-wrap md:items-center md:gap-4">
      <div className="w-full min-w-0 md:w-auto md:flex md:items-center md:gap-2">
        <label className="text-sm text-muted font-medium block mb-1 md:mb-0">Type:</label>
        <select
          value={currentType}
          onChange={(event) => updateFilter('type', event.target.value)}
          className="app-select app-select--compact w-full max-w-full min-w-0 md:min-w-40"
          disabled={isSidebarOpen}
        >
          {TYPES.map((value) => (
            <option key={value} value={value}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="w-full min-w-0 md:w-auto md:flex md:items-center md:gap-2">
        <label className="text-sm text-muted font-medium block mb-1 md:mb-0">Category:</label>
        <select
          value={currentCategory}
          onChange={(event) => updateFilter('category', event.target.value)}
          className="app-select app-select--compact w-full max-w-full min-w-0 md:min-w-56"
          disabled={isSidebarOpen}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={() => setSearchParams(new URLSearchParams())}
          className="w-full md:w-auto md:ml-auto flex items-center justify-center md:justify-start gap-2 text-sm text-muted hover:text-destructive transition-colors"
        >
          <FilterX className="w-4 h-4" />
          Clear Filters
        </button>
      )}
    </div>
  );
}