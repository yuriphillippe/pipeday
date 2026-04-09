import React from 'react';
import { Lock } from 'lucide-react';

interface UpgradePromptProps {
    title?: string;
    message?: string;
    onUpgrade?: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
    title = "Esse recurso é do plano PRO", 
    message = "Faça upgrade para liberar.",
    onUpgrade
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-4">
                <Lock size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                🚫 {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
                🔓 {message}
            </p>
            <button 
                onClick={onUpgrade || (() => window.location.href = '#')} 
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
            >
                👉 Quero desbloquear agora
            </button>
        </div>
    );
};
