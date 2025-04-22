// components/Navbar.tsx
import { useRouter } from 'next/router';
import { FC, ReactNode, useState } from 'react';
import { BellIcon, ClipboardDocumentIcon, DocumentIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface MenuItemProps {
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const MenuItem: FC<MenuItemProps> = ({ label, icon, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center space-x-4 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
      isActive ? 'bg-gray-700' : 'hover:bg-gray-600'
    }`}
  >
    {icon}
    <span className="text-lg">{label}</span>
  </div>
);

const Navbar: FC = () => {
  const router = useRouter();
  const [active, setActive] = useState('/dashboard'); // Default active section

  const navigate = (path: string) => {
    setActive(path);
    router.push(path);
  };

  return (
    <div className="w-full bg-gray-800 text-white flex items-center justify-between px-6 py-4">
      <h1 className="text-2xl font-bold" onClick={()=> navigate('/dashboard')}>Cyber-Guard Dashboard</h1>
      <nav className="flex space-x-4">
        <MenuItem
          label="Alerts"
          icon={<BellIcon className="h-6 w-6" />}
          isActive={active === '/alerts'}
          onClick={() => navigate('/alerts')}
        />
        <MenuItem
          label="Log Analysis"
          icon={<ClipboardDocumentIcon className="h-6 w-6" />}
          isActive={active === '/logs'}
          onClick={() => navigate('/logs')}
        />
        <MenuItem
          label="Reports"
          icon={<DocumentIcon className="h-6 w-6" />}
          isActive={active === '/reports'}
          onClick={() => navigate('/reports')}
        />
        <UserCircleIcon className="h-10 w-10 cursor-pointer" />
      </nav>
    </div>
  );
};

export default Navbar;