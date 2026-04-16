import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, UserCircle, LogOut, Settings, Menu } from 'lucide-react';
// Import the new user store
import { useUserStore } from '../../../store/useUserStore';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';

export function Navbar({ onMenuClick }) {
  const [searchInput, setSearchInput] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const navigate = useNavigate();

  // FIX: Pull the name dynamically from the store instead of hardcoding
  const { user } = useUserStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  return (
    <header className="h-16 border-b border-white/5 bg-background/80 backdrop-blur-md flex items-center justify-between gap-3 px-3 sm:px-4 md:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-full hover:bg-white/10 text-muted"
        >
          <Menu className="w-6 h-6" />
        </button>
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-accent/50 transition-colors w-64"
        >
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search transactions..."
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-muted/70"
          />
        </form>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 text-muted relative min-w-0">
        <form
          onSubmit={handleSearch}
          className="md:hidden flex flex-1 max-w-[14rem] sm:max-w-none sm:w-40 items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2.5 sm:px-3 py-1 focus-within:border-accent/50 transition-colors min-w-0"
        >
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-full min-w-0 text-white placeholder:text-muted/70"
          />
        </form>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-white/10 text-white' : 'hover:bg-white/10'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-white/10 font-medium text-sm text-white bg-black/70">Notifications</div>
              <div className="p-4 text-sm text-muted text-center bg-black/70">No new alerts.</div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className={`flex items-center gap-1 sm:gap-2 p-1 pl-2 sm:pl-3 pr-2 sm:pr-4 rounded-full border transition-colors ${showProfileMenu ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white " />
            {/* The UI is now dynamically reading from state */}
            <span className="hidden sm:inline max-w-28 truncate text-sm font-medium text-white">{user.name}</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-2 overflow-hidden bg-black border border-white/10 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-white/10 mb-1 ">
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="w-4 h-4" /> Account Settings
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setIsResetDialogOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Reset App
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={() => {
          localStorage.clear();
          window.location.reload();
        }}
        title="Reset App"
        message="This will wipe all local data. Continue?"
        confirmLabel="Reset"
      />
    </header>
  );
}