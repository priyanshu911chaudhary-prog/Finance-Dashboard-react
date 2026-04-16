import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, Upload, ShieldCheck, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useBudgetStore } from '../../../store/useBudgetStore';
import { useWalletStore } from '../../../store/useWalletStore';
import { useGoalStore } from '../../../store/useGoalStore';
import { useUserStore } from '../../../store/useUserStore'; // Added
import { transactionApi } from '../../../services/api/transactions';
import { backupService } from '../services/backupService';
import { validateBackupData } from '../services/backupValidation';
import { exportToCSV } from '../../../utils/csvExport';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null);

  // JSON Backup
  const handleExport = () => {
    const backupData = {
      version: '1.2',
      timestamp: new Date().toISOString(),
      user: useUserStore.getState().user, // Added user profile to export
      budgets: useBudgetStore.getState().budgets,
      wallets: useWalletStore.getState().wallets,
      goals: useGoalStore.getState().goals, // Added goals to export
      transactions: queryClient.getQueryData(['transactions']) || [],
    };
    backupService.exportData(backupData);
    setStatus('success');
    setTimeout(() => setStatus(null), 3000);
  };

  // JSON Restore
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rawData = await backupService.parseImportFile(file);
      const data = validateBackupData(rawData);

      // 1. Update UI State (Zustand + React Query)
      useBudgetStore.setState({ budgets: data.budgets });
      useWalletStore.setState({ wallets: data.wallets });
      useGoalStore.setState({ goals: data.goals || [] });
      useUserStore.setState({ user: data.user || { name: 'Guest User', email: '' } });
      const sanitizedTransactions = await transactionApi.replaceTransactions(data.transactions);
      queryClient.setQueryData(['transactions'], sanitizedTransactions);

      // 2. CRITICAL FIX: Manually persist to LocalStorage
      // This ensures data survives a page refresh
      localStorage.setItem('findash-wallets', JSON.stringify({ 
        state: { wallets: data.wallets }, version: 0 
      }));
      localStorage.setItem('findash-budgets', JSON.stringify({ 
        state: { budgets: data.budgets }, version: 0 
      }));
      localStorage.setItem('findash-goals', JSON.stringify({ 
        state: { goals: data.goals || [] }, version: 0 
      }));
      localStorage.setItem('findash-user', JSON.stringify({ 
        state: { user: data.user || { name: 'Guest User', email: '' } }, version: 0 
      }));
      
      // Use the key defined in your transaction.js (findash-transactions)
      localStorage.setItem('findash-transactions', JSON.stringify(sanitizedTransactions));
      
      setStatus('success');
    } catch {
      setStatus('error');
    }
    e.target.value = '';
    setTimeout(() => setStatus(null), 3000);
  };

  // CSV Export
  const handleCSVExport = () => {
    const txData = queryClient.getQueryData(['transactions']) || [];
    exportToCSV(txData, 'findash-transactions.csv');
    setStatus('success');
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-muted mt-1">Manage your application data and preferences.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl max-w-2xl space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Data Backup & Restore</h3>
          <p className="text-sm text-muted">
            Export your transactions, wallets, and budgets to a local JSON file.
          </p>
        </div>

        {status === 'success' && (
          <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="w-5 h-5" /> Operation completed successfully.
          </div>
        )}

        {status === 'error' && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-5 h-5" /> Failed to process backup file.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
          <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white p-4 rounded-xl transition-colors font-medium border border-white/10">
            <Download className="w-5 h-5" /> Export JSON
          </button>
          
          <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
          
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-accent text-background hover:opacity-90 p-4 rounded-xl transition-opacity font-medium">
            <Upload className="w-5 h-5" /> Restore Backup
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl max-w-2xl space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Spreadsheet Export</h3>
          <p className="text-sm text-muted">Export your transaction history as a CSV file to open in Excel.</p>
        </div>
        
        <div className="pt-4 border-t border-white/10">
          <button onClick={handleCSVExport} className="flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 p-4 rounded-xl transition-colors font-medium border border-emerald-500/20 w-full sm:w-auto px-8">
            <FileSpreadsheet className="w-5 h-5" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}