
import React from 'react';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    KanbanSquare,
    Receipt,
    Settings,
    Menu,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const SidebarItem = ({
    icon: Icon,
    label,
    active,
    onClick
}: {
    icon: any;
    label: string;
    active: boolean;
    onClick: () => void
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
    >
        <Icon size={20} />
        {label && <span className="font-medium whitespace-nowrap">{label}</span>}
    </button>
);

const PipedayLogo = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 100 100"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M25 15V85H40V65C40 65 65 65 65 40C65 15 40 15 40 15H25ZM40 30H45C45 30 50 30 50 40C50 50 45 50 45 50H40V30Z" />
        <path
            d="M25 55C25 55 40 55 40 40"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
        />
        <path
            d="M36 43L40 40L43 44"
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    userEmail
}) => {
    return (
        <aside
            className={`${isSidebarOpen ? 'w-64' : 'w-20'
                } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-50`}
        >
            <div className="p-6 flex items-center gap-2 overflow-hidden">
                <div className="text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    <PipedayLogo className="w-8 h-8" />
                </div>
                {isSidebarOpen && <span className="font-bold text-2xl text-[#2d2a8a] dark:text-indigo-300 tracking-tight">Pipeday</span>}
            </div>

            <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
                <SidebarItem
                    icon={LayoutDashboard}
                    label={isSidebarOpen ? "Dashboard" : ""}
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                />
                <SidebarItem
                    icon={KanbanSquare}
                    label={isSidebarOpen ? "Funil de Vendas" : ""}
                    active={activeTab === 'funnel'}
                    onClick={() => setActiveTab('funnel')}
                />
                <SidebarItem
                    icon={Users}
                    label={isSidebarOpen ? "Clientes" : ""}
                    active={activeTab === 'crm'}
                    onClick={() => setActiveTab('crm')}
                />
                <SidebarItem
                    icon={Briefcase}
                    label={isSidebarOpen ? "Serviços" : ""}
                    active={activeTab === 'services'}
                    onClick={() => setActiveTab('services')}
                />
                <SidebarItem
                    icon={Receipt}
                    label={isSidebarOpen ? "Financeiro" : ""}
                    active={activeTab === 'invoices'}
                    onClick={() => setActiveTab('invoices')}
                />
                <SidebarItem
                    icon={Settings}
                    label={isSidebarOpen ? "Configurações" : ""}
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                />
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                >
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2">
                            <ChevronLeft size={20} />
                            <span className="font-medium">Recolher</span>
                        </div>
                    ) : (
                        <ChevronRight size={20} />
                    )}
                </button>

                {isSidebarOpen && (
                    <div className="mt-4 flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold flex-shrink-0">
                            {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{userEmail || 'Admin User'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Plano Pro</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};
