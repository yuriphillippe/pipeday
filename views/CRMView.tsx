
import React, { useState, useEffect } from 'react';
import {
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Trash2,
  Edit,
  UserPlus,
  X,
  History,
  Briefcase,
  Receipt,
  CheckCircle,
  AlertCircle,
  Search,
  Clock
} from 'lucide-react';
import { Client } from '../types';
import { STAGES } from '../constants';
import { useData } from '../src/context/DataContext';
import { usePagination } from '../src/hooks/usePagination';
import PaginationControls from '../src/components/PaginationControls';
import ClientModal from '../src/components/ClientModal';

interface CRMViewProps {
  isDarkMode: boolean;
  searchQuery: string;
}

const CRMView: React.FC<CRMViewProps> = ({ isDarkMode, searchQuery }) => {
  const { clients, invoices, deals, services, addClient, updateClient, deleteClient } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(c => {
    const term = searchQuery.toLowerCase();

    return (
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.whatsapp?.toLowerCase().includes(term) ||
      (c.observations?.toLowerCase().includes(term))
    );
  });

  const {
    currentData: paginatedClients,
    currentPage,
    maxPage,
    jump,
    itemsPerPage,
    setItemsPerPage
  } = usePagination<Client>(filteredClients);

  const handleSave = async (formData: any) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
      } else {
        await addClient(formData);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save client", error);
      throw error;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este cliente?')) {
      try {
        await deleteClient(id);
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Erro ao excluir cliente.");
      }
    }
  };

  const getInvoiceStatusBadge = (status: any) => {
    switch (status) {
      case 'PAID': return <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold">Pago</span>;
      case 'PENDING': return <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full text-[10px] font-bold">Pendente</span>;
      case 'EXPIRED': return <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold">Vencido</span>;
      default: return <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">Cancelado</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Gerenciamento de Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Organize sua base de contatos e visualize históricos.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Local search removed in favor of global search */}
        {searchQuery && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm">
            Filtrando por: <strong>{searchQuery}</strong>
          </div>
        )}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            Total: <span className="font-bold text-slate-800 dark:text-slate-200">{filteredClients.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Nome / Contato</th>
                <th className="px-6 py-4">Serviços</th>
                <th className="px-6 py-4">Faturamento</th>
                <th className="px-6 py-4">Data Cadastro</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedClients.map((client) => {
                const clientInvoices = invoices.filter(i => i.clientId === client.id && i.status === 'PAID');
                const totalBilled = clientInvoices.reduce((acc, curr) => acc + curr.value, 0);
                const activeDeals = deals.filter(d => d.clientId === client.id && d.stage !== 'CLOSED');

                return (
                  <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                          {client.name.charAt(0)}
                        </div>
                        <button
                          onClick={() => setViewingClient(client)}
                          className="text-left hover:opacity-75 transition-opacity"
                        >
                          <p className="font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{client.name}</p>
                          {client.companyName && (
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{client.companyName}</p>
                          )}
                          <div className="flex items-center gap-3 mt-0.5">
                            {client.email && <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Mail size={12} /> {client.email}</span>}
                            {client.whatsapp && <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Phone size={12} /> {client.whatsapp}</span>}
                          </div>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {activeDeals.length > 0 && (
                        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-md text-xs font-medium">
                          {activeDeals.length} {activeDeals.length === 1 ? 'ativo' : 'ativos'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {totalBilled > 0 && (
                        <>
                          <p className="font-medium text-slate-800 dark:text-slate-200">R$ {totalBilled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          {clientInvoices.length > 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{clientInvoices.length} {clientInvoices.length === 1 ? 'fatura paga' : 'faturas pagas'}</p>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
                        {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setViewingClient(client)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                          title="Ver Detalhes"
                        >
                          <Search size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredClients.length === 0 && (
            <div className="py-20 text-center">
              <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {searchQuery ? `Nenhum cliente encontrado para "${searchQuery}"` : "Nenhum cliente cadastrado."}
              </p>
            </div>
          )}
        </div>

        {filteredClients.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={maxPage}
            onPageChange={jump}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredClients.length}
          />
        )}
      </div>

      {/* Modal Histórico do Cliente */}
      {viewingClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-slate-900 text-white shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/20 shadow-inner">
                  {viewingClient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{viewingClient.name}</h2>
                  {viewingClient.companyName && <p className="text-indigo-100 text-sm font-bold flex items-center gap-1.5 mt-0.5 opacity-90"><Briefcase size={14} /> {viewingClient.companyName}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-indigo-50 text-xs font-medium flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg"><Mail size={12} /> {viewingClient.email}</span>
                    <span className="text-indigo-50 text-xs font-medium flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg"><Phone size={12} /> {viewingClient.whatsapp}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingClient(null)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all backdrop-blur-sm relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50">
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
                      <Receipt size={22} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Recebido</p>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-50">
                    R$ {invoices.filter(i => i.clientId === viewingClient.id && i.status === 'PAID').reduce((acc, curr) => acc + curr.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2">{invoices.filter(i => i.clientId === viewingClient.id && i.status === 'PAID').length} faturas confirmadas</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                      <Briefcase size={22} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Negócios Ativos</p>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-50">
                    {deals.filter(d => d.clientId === viewingClient.id && d.stage !== 'CLOSED').length}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2">No funil de vendas agora</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 dark:text-amber-400">
                      <Calendar size={22} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Início da Parceria</p>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-50">
                    {new Date(viewingClient.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2">Cadastrado em {new Date(viewingClient.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna 1: Negócios */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Briefcase size={18} />
                      </div>
                      <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Negócios no Funil</h3>
                    </div>
                    <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg uppercase tracking-widest">
                      {deals.filter(d => d.clientId === viewingClient.id).length} Total
                    </span>
                  </div>
                  <div className="space-y-4">
                    {deals.filter(d => d.clientId === viewingClient.id).length > 0 ? (
                      deals.filter(d => d.clientId === viewingClient.id).map(deal => {
                        const service = services.find(s => s.id === deal.serviceId);
                        const stageInfo = STAGES.find(s => s.id === deal.stage);
                        return (
                          <div key={deal.id} className="p-5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50">
                            <div>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-100">{service?.name || 'Serviço Personalizado'}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${stageInfo?.color}`}>
                                  {stageInfo?.label}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                  <Calendar size={10} /> {new Date(deal.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-indigo-600 dark:text-indigo-400 text-base">R$ {deal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum negócio registrado</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coluna 2: Faturas */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                        <Receipt size={18} />
                      </div>
                      <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Extrato Financeiro</h3>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg uppercase tracking-widest">
                      {invoices.filter(i => i.clientId === viewingClient.id).length} Total
                    </span>
                  </div>
                  <div className="space-y-4">
                    {invoices.filter(i => i.clientId === viewingClient.id).length > 0 ? (
                      invoices.filter(i => i.clientId === viewingClient.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(inv => (
                        <div key={inv.id} className="p-5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-emerald-100 dark:hover:border-emerald-900/50">
                          <div className="flex gap-4 items-center">
                            <div className={`w-2 h-10 rounded-full ${inv.status === 'PAID' ? 'bg-emerald-500' : inv.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                            <div>
                              <div className="flex items-center gap-3">
                                {inv.invoiceNumber && <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{inv.invoiceNumber}</p>}
                                {getInvoiceStatusBadge(inv.status)}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1.5">
                                <Clock size={10} /> Vencimento: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <p className="font-black text-slate-900 dark:text-slate-50 text-base">R$ {inv.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhuma fatura gerada</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Observações */}
              {viewingClient.observations && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-amber-200/50 dark:border-amber-900/30 flex gap-5 relative overflow-hidden shadow-sm shadow-amber-100/50 dark:shadow-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400 h-fit shrink-0 shadow-inner">
                    <AlertCircle size={24} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-[0.2em] mb-3">Notas Estratégicas</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed whitespace-pre-wrap">{viewingClient.observations}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Reutilizável de Cliente */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editingClient={editingClient}
      />
    </div>
  );
};

export default CRMView;
