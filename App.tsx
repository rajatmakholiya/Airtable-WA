import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { FormBuilder } from './pages/FormBuilder';
import { FormViewer } from './pages/FormViewer';
import { ResponsesList } from './pages/ResponsesList';
import { User, FormDefinition } from './types';
import { getUser, login, logout } from './services/storage';

type View = 'LOGIN' | 'DASHBOARD' | 'BUILDER' | 'VIEWER' | 'RESPONSES';

const App: React.FC = () => {
  const [view, setView] = useState<View>('LOGIN');
  const [user, setUser] = useState<User | null>(null);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [activeFormDef, setActiveFormDef] = useState<FormDefinition | null>(null);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUser(u);
      setView('DASHBOARD');
    }
  }, []);

  const handleLogin = () => {
    const u = login();
    setUser(u);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setView('LOGIN');
  };

  if (view === 'LOGIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
           <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">A</div>
           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to AirForm Sync</h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <button
              onClick={handleLogin}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'VIEWER' && activeFormId) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <FormViewer formId={activeFormId} onClose={() => setView('DASHBOARD')} />
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {view === 'DASHBOARD' && (
        <Dashboard 
          onCreateClick={() => setView('BUILDER')} 
          onViewForm={(id) => { setActiveFormId(id); setView('VIEWER'); }}
          onViewResponses={(form) => { setActiveFormDef(form); setView('RESPONSES'); }}
        />
      )}
      
      {view === 'BUILDER' && (
        <FormBuilder 
          onCancel={() => setView('DASHBOARD')}
          onSave={() => setView('DASHBOARD')}
        />
      )}

      {view === 'RESPONSES' && activeFormDef && (
        <ResponsesList form={activeFormDef} onBack={() => setView('DASHBOARD')} />
      )}
    </Layout>
  );
};

export default App;