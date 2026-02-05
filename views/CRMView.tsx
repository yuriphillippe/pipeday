
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
  Search
} from 'lucide-react';
import { Client } from '../types';
import { STAGES } from '../constants';
import { useData } from '../src/context/DataContext';
import { usePagination } from '../src/hooks/usePagination';
import PaginationControls from '../src/components/PaginationControls';

interface CRMViewProps {
  isDarkMode: boolean;
  searchQuery: string;
}

const CRMView: React.FC<CRMViewProps> = ({ isDarkMode, searchQuery }) => {
  const { clients, invoices, deals, services, addClient, updateClient, deleteClient } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    companyName: '',
    observations: ''
  });

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

  const handleSave = async () => {
    if (!formData.name) return;

    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
      } else {
        await addClient(formData);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save client", error);
      alert("Erro ao salvar cliente.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', whatsapp: '', companyName: '', observations: '' });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      whatsapp: client.whatsapp,
      companyName: client.companyName || '',
      observations: client.observations || ''
    });
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
                          <p className="font-medium text-slate-800 dark:text-slate-200">R$ {totalBilled.toLocaleString('pt-BR')}</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 dark:bg-indigo-900 text-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  {viewingClient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{viewingClient.name}</h2>
                  {viewingClient.companyName && <p className="text-indigo-200 text-sm font-medium">{viewingClient.companyName}</p>}
                  <p className="text-indigo-100 text-xs">{viewingClient.email} • {viewingClient.whatsapp}</p>
                </div>
              </div>
              <button onClick={() => setViewingClient(null)} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pago</p>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    R$ {invoices.filter(i => i.clientId === viewingClient.id && i.status === 'PAID').reduce((acc, curr) => acc + curr.value, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Negócios Ativos</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {deals.filter(d => d.clientId === viewingClient.id && d.stage !== 'CLOSED').length}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cadastro desde</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {new Date(viewingClient.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna 1: Negócios */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                    <Briefcase size={18} className="text-indigo-600" />
                    <h3>Negócios e Funil</h3>
                  </div>
                  <div className="space-y-2">
                    {deals.filter(d => d.clientId === viewingClient.id).length > 0 ? (
                      deals.filter(d => d.clientId === viewingClient.id).map(deal => {
                        const service = services.find(s => s.id === deal.serviceId);
                        const stageInfo = STAGES.find(s => s.id === deal.stage);
                        return (
                          <div key={deal.id} className="p-3 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold dark:text-slate-200">{service?.name || 'Serviço Personalizado'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stageInfo?.color}`}>
                                  {stageInfo?.label}
                                </span>
                                <span className="text-[10px] text-slate-400">{new Date(deal.createdAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                            <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">R$ {deal.value.toLocaleString('pt-BR')}</p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nenhum negócio registrado.</p>
                    )}
                  </div>
                </div>

                {/* Coluna 2: Faturas */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                    <Receipt size={18} className="text-indigo-600" />
                    <h3>Histórico de Faturas</h3>
                  </div>
                  <div className="space-y-2">
                    {invoices.filter(i => i.clientId === viewingClient.id).length > 0 ? (
                      invoices.filter(i => i.clientId === viewingClient.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(inv => (
                        <div key={inv.id} className="p-3 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-400">#{inv.id.substring(0, 8)}</p>
                              {getInvoiceStatusBadge(inv.status)}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Vencimento: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">R$ {inv.value.toLocaleString('pt-BR')}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nenhuma fatura gerada.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Observações */}
              {viewingClient.observations && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                  <p className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase mb-1">Notas Internas</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 italic">{viewingClient.observations}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente (Mantido) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button onClick={closeModal} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Empresa (Opcional)</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Tech Solutions Ltda"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações</label>
                <textarea
                  rows={3}
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Detalhes adicionais sobre o cliente..."
                ></textarea>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
              >
                Salvar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMView;
