import { useSearchParams, useOutletContext } from 'react-router-dom';
import { FilterX } from 'lucide-react';
import { TRANSACTION_CATEGORIES } from '../constants';
import { CustomSelect } from '../../../shared/components/ui/CustomSelect';

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
    <div className="relative z-40 glass-panel p-4 rounded-2xl mb-6 animate-in fade-in grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
      <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
        <label className="text-sm text-muted font-medium block mb-1 sm:mb-0">Type:</label>
        <CustomSelect
          value={currentType}
          options={TYPES.map((value) => ({
            value,
            label: value.charAt(0).toUpperCase() + value.slice(1),
          }))}
          onChange={(value) => updateFilter('type', value)}
          compact
          className="w-full sm:min-w-40"
          disabled={isSidebarOpen}
        />
      </div>
      
      <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
        <label className="text-sm text-muted font-medium block mb-1 sm:mb-0">Category:</label>
        <CustomSelect
          value={currentCategory}
          options={CATEGORIES}
          onChange={(value) => updateFilter('category', value)}
          compact
          className="w-full sm:min-w-56"
          disabled={isSidebarOpen}
        />
      </div>

      {hasActiveFilters && (
        <button 
          onClick={() => setSearchParams(new URLSearchParams())}
          className="w-full sm:w-auto sm:ml-auto flex items-center justify-center sm:justify-start gap-2 text-sm text-muted hover:text-destructive transition-colors"
        >
          <FilterX className="w-4 h-4" />
          Clear Filters
        </button>
      )}
    </div>
  );
}