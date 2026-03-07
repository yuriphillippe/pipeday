
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, User } from 'lucide-react';

const LoginView: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const translateAuthError = (message: string) => {
        const errors: { [key: string]: string } = {
            'Invalid login credentials': 'Credenciais de login inválidas. Verifique seu email e senha.',
            'Email not confirmed': 'Email não confirmado. Por favor, verifique sua caixa de entrada.',
            'User already registered': 'Este email já está cadastrado.',
            'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
            'Invalid email': 'O email inserido é inválido.',
            'User not found': 'Usuário não encontrado.',
            'Password recovery requires an email': 'A recuperação de senha requer um email.',
            'Too many requests': 'Muitas solicitações. Tente novamente mais tarde.',
            'New password should be different from the old password': 'A nova senha deve ser diferente da antiga.'
        };

        for (const [key, value] of Object.entries(errors)) {
            if (message.includes(key)) return value;
        }

        return message || 'Ocorreu um erro inesperado.';
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                            phone: phone,
                        }
                    }
                });
                if (error) throw error;
                setMessage('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.');
            }
        } catch (err: any) {
            setError(translateAuthError(err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Por favor, insira seu email primeiro.');
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setMessage('Email de redefinição enviado com sucesso!');
        } catch (err: any) {
            setError(translateAuthError(err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[100dvh] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 overflow-hidden">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 max-h-full overflow-y-auto custom-scrollbar">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
                        <svg viewBox="0 0 100 100" className="w-10 h-10 text-white" fill="currentColor">
                            <path d="M25 15V85H40V65C40 65 65 65 65 40C65 15 40 15 40 15H25ZM40 30H45C45 30 50 30 50 40C50 50 45 50 45 50H40V30Z" />
                            <path d="M25 55C25 55 40 55 40 40" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                            <path d="M36 43L40 40L43 44" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isLogin ? 'Entre para acessar seu CRM' : 'Comece a organizar suas vendas hoje'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                                        placeholder="Seu nome"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    </span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                                        placeholder="(00) 00000-0000"
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                            {isLogin && (
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
                                >
                                    Esqueceu sua senha?
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-lg">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Entrar' : 'Criar Conta')}
                    </button>

                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                    >
                        {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
