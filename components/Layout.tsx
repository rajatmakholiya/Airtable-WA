import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
             <span className="text-xl font-bold text-gray-900 tracking-tight">AirForm Sync</span>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
               <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user.name}</span>
               <button 
                 onClick={onLogout}
                 className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
               >
                 Sign Out
               </button>
            </div>
          ) : (
             <span className="text-sm text-gray-400">Not connected</span>
          )}
        </div>
      </header>
      
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
         <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
           AirForm Sync &copy; {new Date().getFullYear()}
         </div>
      </footer>
    </div>
  );
};