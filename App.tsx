import React, { useState } from 'react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { HealthAgent } from './components/HealthAgent';
import { ProgressDiary } from './components/ProgressDiary';
import { FoodDiary } from './components/FoodDiary';
import type { User } from './types';
import { useUserLocalStorage } from './hooks/useLocalStorage';


type ActiveTab = 'dashboard' | 'food' | 'agent' | 'diary';

const App: React.FC = () => {
  // A simple user state. In a real app, this would be more robust.
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Falha ao analisar o currentUser do localStorage", error);
        localStorage.removeItem('currentUser'); // Limpa dados corrompidos
        return null;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLogin} />;
  }
  
  // Fix: Replaced JSX.Element with React.ReactNode to resolve namespace error.
  const TabButton = ({ tab, label, icon }: { tab: ActiveTab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-3 py-2 text-sm md:text-base font-semibold rounded-md transition-colors duration-300 ${
        activeTab === tab
          ? 'bg-brand-primary text-white shadow'
          : 'text-gray-600 hover:bg-brand-primary/10'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={currentUser} />;
      case 'food':
          return <FoodDiary user={currentUser} />;
      case 'agent':
        return <HealthAgent />;
      case 'diary':
        return <ProgressDiary user={currentUser} />;
      default:
        return <Dashboard user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans text-gray-800">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.25 14.5l-3.75-3.75 1.41-1.41L10.75 13.08l5.84-5.83 1.41 1.41L10.75 16.5z"/>
             </svg>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-brand-dark">Bem-Estar Total</h1>
              <p className="text-xs md:text-sm text-gray-500">Olá, {currentUser.username}!</p>
            </div>
          </div>
          <nav className="flex items-center space-x-1 md:space-x-2">
             <div className="flex items-center space-x-1 md:space-x-2 bg-gray-100 p-1 rounded-lg">
                <TabButton tab="dashboard" label="Dashboard" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>} />
                <TabButton tab="food" label="Refeições" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-3.5-3.5V2.5a.5.5 0 011 0v10A2.5 2.5 0 005.5 15H15a.5.5 0 010 1H5.5z" /><path d="M15.354 4.146a.5.5 0 010 .708l-7 7a.5.5 0 01-.708-.708l7-7a.5.5 0 01.708 0zM9 13a1 1 0 11-2 0 1 1 0 012 0z" /></svg>} />
                <TabButton tab="agent" label="Assistente" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>} />
                <TabButton tab="diary" label="Diário" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>} />
             </div>
             <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-full transition-colors" aria-label="Sair">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>

      <footer className="text-center py-4 mt-8 text-gray-500 text-sm">
        <p>Conteúdo gerado por IA. Consulte sempre um profissional de saúde.</p>
      </footer>
    </div>
  );
};

export default App;