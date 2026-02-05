
import React from 'react';
import { Search, Sun, Moon, Bell, BrainCircuit, LogOut } from 'lucide-react';

interface HeaderProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    isDarkMode,
    setIsDarkMode,
    searchQuery,
    setSearchQuery,
    onLogout
}) => {
    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full w-full max-w-md">
                <Search size={18} className="text-slate-400 dark:text-slate-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por clientes, negócios..."
                    className="bg-transparent border-none focus:outline-none text-sm text-slate-600 dark:text-slate-300 w-full"
                />
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-4">
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:block">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>
                <button className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                    <BrainCircuit size={18} />
                    <span className="hidden lg:inline">Pipe AI</span>
                </button>
                <button
                    onClick={onLogout}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors"
                    title="Sair"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};
