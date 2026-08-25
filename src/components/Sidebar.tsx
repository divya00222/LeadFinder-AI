import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  Filter, 
  CheckSquare, 
  Megaphone, 
  MessageSquare, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Blocks, 
  UsersRound, 
  Settings,
  X,
  Zap,
  Sparkles
} from 'lucide-react';
import { Avatar } from './ui/Avatar';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Lead Finder', path: '/lead-finder', icon: Search },
  { name: 'Leads', path: '/leads', icon: Users },
  { name: 'Pipeline', path: '/pipeline', icon: Filter },
  { name: 'AI Approval', path: '/ai-approval', icon: CheckSquare },
  { name: 'AI Intelligence', path: '/intelligence', icon: Sparkles },
  { name: 'Campaigns', path: '/campaigns', icon: Megaphone },
  { name: 'Messages', path: '/messages', icon: MessageSquare },
  { name: 'Tasks & Follow-ups', path: '/tasks', icon: CheckCircle2 },
  { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Integrations', path: '/integrations', icon: Blocks },
  { name: 'Team', path: '/team', icon: UsersRound },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-sidebar text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-brand-primary p-1.5 rounded-lg text-white">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">LeadFinder <span className="text-brand-secondary">AI</span></span>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-brand-primary text-white' 
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                {item.name}
                
                {item.name === 'AI Approval' && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-brand-primary' : 'bg-brand-primary text-white'}`}>
                    12
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-semibold text-white mb-1">Pro Plan</h4>
            <p className="text-xs text-gray-400 mb-3">5,000 AI credits remaining</p>
            <button className="w-full bg-brand-primary hover:bg-brand-secondary transition-colors text-white text-xs font-medium py-2 rounded-lg shadow-sm">
              Upgrade Plan
            </button>
          </div>
          
          <div className="flex items-center gap-3 px-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
            <Avatar fallback="JD" className="bg-gradient-to-tr from-brand-primary to-brand-secondary text-white font-bold" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Jane Doe</p>
              <p className="text-xs text-gray-400 truncate">jane@agency.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
