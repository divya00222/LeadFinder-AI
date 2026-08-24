import { Menu, Search, Bell, Settings, LogOut, User } from 'lucide-react';
import { Dropdown, DropdownItem } from './ui/Dropdown';
import { Avatar } from './ui/Avatar';

export function Header({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean, setSidebarOpen: (val: boolean) => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button
          className="lg:hidden text-brand-text hover:text-brand-primary transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden sm:flex max-w-md w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
            placeholder="Search leads, campaigns, or messages..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-brand-text transition-colors rounded-full hover:bg-gray-100">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-danger rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
              <Avatar fallback="JD" className="bg-gradient-to-tr from-brand-primary to-brand-secondary text-white font-bold" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-brand-text leading-tight">Jane Doe</p>
                <p className="text-xs text-brand-muted leading-tight">Sales Director</p>
              </div>
            </div>
          }
        >
          <div className="px-4 py-3 border-b border-gray-100 md:hidden">
            <p className="text-sm font-medium text-brand-text">Jane Doe</p>
            <p className="text-xs text-brand-muted">Sales Director</p>
          </div>
          <DropdownItem icon={<User size={16} />}>My Profile</DropdownItem>
          <DropdownItem icon={<Settings size={16} />}>Account Settings</DropdownItem>
          <div className="my-1 border-t border-gray-100"></div>
          <DropdownItem icon={<LogOut size={16} />} danger>Log out</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
