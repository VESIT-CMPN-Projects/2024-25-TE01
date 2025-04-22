import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  PieChart, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Search, label: 'Log Analysis', href: '/logs' },
  { icon: FileText, label: 'Reports', href: '#' },
  { icon: PieChart, label: 'Visualizations', href: '#' },
  { icon: Bell, label: 'Alerts', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
  { icon: HelpCircle, label: 'Help', href: '#' },
];

const Sidebar = () => {
  return (
    <div className="h-screen bg-white border-r border-gray-200 w-full">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">Security Hub</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1 p-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
            onClick={() => {/* Add logout logic */}}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;