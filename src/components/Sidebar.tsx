import { useState } from 'react';
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
  Sparkles,
  Check,
  Crown
} from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Toast, useToast } from './ui/Toast';
import { PaymentCheckoutModal, PlanDetails } from './billing/PaymentCheckoutModal';

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

const plans = [
  {
    name: 'Pro',
    price: '$49',
    numericPrice: 49,
    period: '/month',
    credits: '5,000 AI credits',
    numericCredits: 5000,
    features: ['5,000 Lead Searches/mo', 'AI Outreach & Approval Queue', 'WhatsApp & Gmail integration', 'Standard Rate Limits'],
    popular: false,
  },
  {
    name: 'Growth',
    price: '$99',
    numericPrice: 99,
    period: '/month',
    credits: '20,000 AI credits',
    numericCredits: 20000,
    features: ['20,000 Lead Searches/mo', 'Multi-channel Campaign Sequencing', 'AI Reply Classification', 'Priority Verification & Dedicated IPs', '5 Team Members'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$249',
    numericPrice: 249,
    period: '/month',
    credits: 'Unlimited AI credits',
    numericCredits: 100000,
    features: ['Unlimited Lead Searches', 'Custom Supabase RLS policies', 'Full CRM Intelligence Engine', 'Dedicated Account Manager', 'Custom API Integrations'],
    popular: false,
  },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const location = useLocation();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Growth');
  const [activePlan, setActivePlan] = useState('Pro');
  const [credits, setCredits] = useState(5000);

  // Payment Checkout Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanDetails>({
    name: 'Growth Plan',
    price: 99,
    period: '/month',
    credits: 20000,
  });

  const { toasts, toast, removeToast } = useToast();

  const handleOpenCheckout = (planItem: typeof plans[0]) => {
    setCheckoutPlan({
      name: `${planItem.name} Plan`,
      price: planItem.numericPrice,
      period: planItem.period,
      credits: planItem.numericCredits,
    });
    setIsUpgradeModalOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOpenCreditPackCheckout = () => {
    setCheckoutPlan({
      name: '5,000 Instant AI Credits Recharge',
      price: 20,
      period: 'one-time',
      credits: 5000,
      isCreditPack: true,
    });
    setIsUpgradeModalOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (planName: string, newCredits: number) => {
    if (planName.includes('Credit') || planName.includes('Recharge')) {
      setCredits(prev => prev + newCredits);
      toast(`Payment successful! Added +${newCredits.toLocaleString()} AI credits to your workspace balance.`, 'success');
    } else {
      const cleanName = planName.replace(' Plan', '');
      setActivePlan(cleanName);
      setCredits(prev => Math.max(prev, newCredits));
      toast(`Payment verified! Upgraded to ${cleanName} Plan with ${newCredits.toLocaleString()} AI credits.`, 'success');
    }
  };

  return (
    <>
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

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
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-white">{activePlan} Plan</h4>
              <span className="text-[10px] font-bold bg-brand-primary/30 text-indigo-300 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{credits.toLocaleString()} AI credits remaining</p>
            <button 
              id="sidebar-upgrade-plan-btn"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-full bg-brand-primary hover:bg-brand-secondary transition-colors text-white text-xs font-medium py-2 rounded-lg shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Crown size={14} />
              Upgrade Plan
            </button>
          </div>
          
          <Link to="/settings" className="flex items-center gap-3 px-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
            <Avatar fallback="JD" className="bg-gradient-to-tr from-brand-primary to-brand-secondary text-white font-bold" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Jane Doe</p>
              <p className="text-xs text-gray-400 truncate">jane@agency.com</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Upgrade Plan Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade Workspace Plan"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-brand-muted">
            Scale your B2B lead generation, unlock higher rate limits, and boost your monthly AI outreach credits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => {
              const isCurrent = activePlan === p.name;
              const isSelected = selectedPlan === p.name;

              return (
                <div
                  key={p.name}
                  onClick={() => setSelectedPlan(p.name)}
                  className={`relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected 
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute -top-2.5 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Current Plan
                    </span>
                  )}

                  <div>
                    <h4 className="text-base font-bold text-brand-text mb-1">{p.name}</h4>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-black text-brand-text">{p.price}</span>
                      <span className="text-xs text-brand-muted">{p.period}</span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 mb-3">{p.credits}</p>

                    <ul className="space-y-2 text-xs text-gray-600 mb-4">
                      {p.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    size="sm"
                    disabled={isCurrent}
                    variant={isCurrent ? 'outline' : isSelected ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCurrent) {
                        handleOpenCheckout(p);
                      }
                    }}
                    className={`w-full text-xs font-semibold ${
                      !isCurrent ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm active:scale-[0.98]' : ''
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : `Choose ${p.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-slate-800">Need immediate one-time credits?</h5>
              <p className="text-xs text-slate-500">Recharge 5,000 additional AI search & messaging credits for $20.</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenCreditPackCheckout}
              className="text-xs shrink-0 bg-white hover:bg-slate-100 text-slate-800 font-semibold cursor-pointer active:scale-[0.98]"
            >
              + 5,000 Credits ($20)
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment & Checkout System Modal */}
      <PaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={checkoutPlan}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
