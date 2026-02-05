
import React, { useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Briefcase,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '../src/context/DataContext';
import { STAGES } from '../constants';

interface DashboardViewProps {
  isDarkMode: boolean;
  searchQuery?: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ isDarkMode, searchQuery = '' }) => {
  const { clients, deals, invoices, userProfile } = useData();

  // Global Search Logic
  const searchResults = useMemo(() => {
    if (!searchQuery) return { clients: [], deals: [] };
    const term = searchQuery.toLowerCase();

    const matchedClients = clients.filter(c =>
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );

    const matchedDeals = deals.filter(d => {
      const client = clients.find(c => c.id === d.clientId);
      return client?.name?.toLowerCase().includes(term);
    });

    return { clients: matchedClients, deals: matchedDeals };
  }, [searchQuery, clients, deals]);

  const stats = useMemo(() => {
    const receivedThisMonth = invoices
      .filter(i => i.status === 'PAID')
      .reduce((acc, curr) => acc + curr.value, 0);

    const pendingAmount = invoices
      .filter(i => i.status === 'PENDING')
      .reduce((acc, curr) => acc + curr.value, 0);

    const lostAmount = deals
      .filter(d => d.stage === 'LOST')
      .reduce((acc, curr) => acc + curr.value, 0);

    const expiredCount = invoices.filter(i => i.status === 'EXPIRED').length;
    const lostCount = deals.filter(d => d.stage === 'LOST').length;
    const activeClients = clients.length;

    // Calculate stale deals (NEW_CONTACT > 48h)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const staleDealsCount = deals.filter(d =>
      d.stage === 'NEW_CONTACT' &&
      new Date(d.createdAt) < fortyEightHoursAgo
    ).length;

    return { receivedThisMonth, pendingAmount, expiredCount, activeClients, lostCount, staleDealsCount, lostAmount };
  }, [clients, invoices, deals]);

  const chartData = [
    { name: 'Recebido', Valor: stats.receivedThisMonth, color: isDarkMode ? '#818cf8' : '#4f46e5' },
    { name: 'Pendente', Valor: stats.pendingAmount, color: isDarkMode ? '#fbbf24' : '#f59e0b' },
    { name: 'Perdido', Valor: stats.lostAmount, color: isDarkMode ? '#f87171' : '#ef4444' },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, colorClass, darkColorClass, isCurrency }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl flex items-center justify-center font-bold text-lg w-10 h-10 ${colorClass} ${darkColorClass}`}>
          {Icon ? <Icon size={24} /> : "R$"}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
          {isCurrency ? `R$ ${value.toLocaleString('pt-BR')}` : value}
        </h3>
      </div>
    </div>
  );

  if (searchQuery) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Search size={24} />
          Resultados para "{searchQuery}"
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Users size={20} /> Clientes ({searchResults.clients.length})
            </h3>
            <div className="space-y-2">
              {searchResults.clients.length > 0 ? (
                searchResults.clients.map(client => (
                  <div key={client.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">Nenhum cliente encontrado.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Briefcase size={20} /> Negócios ({searchResults.deals.length})
            </h3>
            <div className="space-y-2">
              {searchResults.deals.length > 0 ? (
                searchResults.deals.map(deal => {
                  const client = clients.find(c => c.id === deal.clientId);
                  return (
                    <div key={deal.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">R$ {deal.value.toLocaleString('pt-BR')}</p>
                        <p className="text-xs text-slate-500">{client?.name || 'Cliente desconhecido'}</p>
                      </div>
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        {STAGES.find(s => s.id === deal.stage)?.label || deal.stage}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm">Nenhum negócio encontrado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{getGreeting()}, {userProfile.name}!</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Aqui está o que está acontecendo no seu negócio hoje.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400">
            Últimos 30 dias
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Recebido"
          value={stats.receivedThisMonth}
          icon={null}
          trend={12}
          isCurrency={true}
          colorClass="bg-green-50 text-green-600"
          darkColorClass="dark:bg-green-900/20 dark:text-green-400"
        />
        <StatCard
          title="Total Pendente"
          value={stats.pendingAmount}
          icon={Clock}
          trend={-5}
          isCurrency={true}
          colorClass="bg-yellow-50 text-yellow-600"
          darkColorClass="dark:bg-yellow-900/20 dark:text-yellow-400"
        />
        <StatCard
          title="Faturas Vencidas"
          value={stats.expiredCount}
          icon={AlertCircle}
          colorClass="bg-red-50 text-red-600"
          darkColorClass="dark:bg-red-900/20 dark:text-red-400"
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.activeClients}
          icon={Users}
          trend={2}
          colorClass="bg-indigo-50 text-indigo-600"
          darkColorClass="dark:bg-indigo-900/20 dark:text-indigo-400"
        />
        <StatCard
          title="Projetos Perdidos"
          value={stats.lostCount}
          icon={XCircle}
          colorClass="bg-red-50 text-red-600"
          darkColorClass="dark:bg-red-900/20 dark:text-red-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Performance Financeira</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: isDarkMode ? '#0f172a' : '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    color: isDarkMode ? '#f1f5f9' : '#1e293b'
                  }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
                <Bar dataKey="Valor" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Alertas Rápidos</h3>
          <div className="space-y-4">
            {stats.expiredCount > 0 ? (
              <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">Pagamentos Atrasados</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Você tem {stats.expiredCount} faturas vencidas que precisam de atenção.</p>
                  <button className="text-xs font-bold text-red-700 dark:text-red-400 mt-2 hover:underline">Resolver agora</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                <TrendingUp className="text-green-500 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">Tudo em dia!</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Não há cobranças vencidas no momento. Bom trabalho!</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              <Users className="text-indigo-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Novas Oportunidades</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                  {stats.staleDealsCount === 0
                    ? "Nenhum contato esperando proposta há mais de 48h."
                    : `${stats.staleDealsCount} contatos no funil não recebem uma proposta há mais de 48h.`}
                </p>
                <button className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mt-2 hover:underline">Ver funil</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
