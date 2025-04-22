import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <div className="w-1/4">
        <Sidebar />
      </div>
      <div className="w-3/4 bg-gray-50">
        {children}
      </div>
    </div>
  );
};

export default Layout;