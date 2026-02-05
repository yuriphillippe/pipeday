
import React, { useState } from 'react';
import { Plus, Receipt, Calendar, Copy, Download, QrCode, ExternalLink, CheckCircle, Clock, AlertCircle, X, Trash2, Eye } from 'lucide-react';
import { Invoice, Client, Service } from '../types';
import { useData } from '../src/context/DataContext';
import InvoiceGenerator from '../src/components/InvoiceGenerator';
import { usePagination } from '../src/hooks/usePagination';
import PaginationControls from '../src/components/PaginationControls';

interface InvoicesViewProps {
  isDarkMode: boolean;
  searchQuery: string;
}

const InvoicesView: React.FC<InvoicesViewProps> = ({ isDarkMode, searchQuery }) => {
  const { invoices, clients, services, addInvoice, updateInvoice, deleteInvoice: contextDeleteInvoice, userProfile } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    serviceId: '',
    value: 0,
    dueDate: new Date().toISOString().split('T')[0]
  });


  const filteredInvoices = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    const matchesSearch = inv.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const {
    currentData: paginatedInvoices,
    currentPage,
    maxPage,
    jump,
    itemsPerPage,
    setItemsPerPage
  } = usePagination<Invoice>(filteredInvoices);

  const handleCreateInvoice = async () => {
    if (!newInvoice.clientId || !newInvoice.serviceId) return;

    try {
      await addInvoice({
        clientId: newInvoice.clientId,
        serviceId: newInvoice.serviceId,
        value: newInvoice.value,
        dueDate: newInvoice.dueDate,
        status: 'PENDING',
        pixCode: '' // Generate or leave blank
      });
      setIsModalOpen(false);
      setNewInvoice({ clientId: '', serviceId: '', value: 0, dueDate: new Date().toISOString().split('T')[0] });
    } catch {
      alert("Erro ao criar fatura.");
    }
  };

  const handleShowPix = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPixModalOpen(true);
  };

  const markAsPaid = async (id: string) => {
    try {
      await updateInvoice(id, { status: 'PAID' });
      setIsPixModalOpen(false);
    } catch {
      alert("Erro ao atualizar fatura.");
    }
  };

  const deleteInvoice = async (id: string) => {
    if (confirm('Excluir permanentemente esta fatura?')) {
      try {
        await contextDeleteInvoice(id);
      } catch {
        alert("Erro ao excluir fatura.");
      }
    }
  };

  const getStatusBadge = (status: any) => {
    switch (status) {
      case 'PAID': return <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 min-w-[100px]"><CheckCircle size={14} /> Pago</span>;
      case 'PENDING': return <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 min-w-[100px]"><Clock size={14} /> Pendente</span>;
      case 'EXPIRED': return <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 min-w-[100px]"><AlertCircle size={14} /> Vencido</span>;
      case 'CANCELLED': return <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center justify-center min-w-[100px]">Cancelado</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Financeiro</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gere cobranças via Pix e controle seus recebimentos.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          >
            <option value="ALL">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="PAID">Pago</option>
            <option value="EXPIRED">Vencido</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Nova Fatura
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
              <th className="px-6 py-4">ID / Data</th>
              <th className="px-6 py-4">Cliente / Serviço</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedInvoices.map((inv) => {
              const client = clients.find(c => c.id === inv.clientId);
              const service = services.find(s => s.id === inv.serviceId);

              return (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">#{inv.id.substring(0, 8)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(inv.createdAt).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                      {client?.name || '---'}
                      {client?.companyName && <span className="text-xs font-normal text-slate-500 ml-1">({client.companyName})</span>}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{service?.name || '---'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                      <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
                      {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-slate-50">R$ {inv.value.toLocaleString('pt-BR')}</p>
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsGeneratorOpen(true);
                        }}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        title="Ver Fatura"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsGeneratorOpen(true);
                        }}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        title="Baixar PDF"
                      >
                        <Download size={16} />
                      </button>
                      {inv.status === 'PENDING' && (
                        <button
                          onClick={() => handleShowPix(inv)}
                          className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-1"
                        >
                          <QrCode size={14} /> Pix
                        </button>
                      )}
                      <button
                        onClick={() => deleteInvoice(inv.id)}
                        className="p-2 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredInvoices.length === 0 && (
          <div className="py-20 text-center">
            <Receipt size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Nenhuma fatura encontrada.</p>
          </div>
        )}
        {filteredInvoices.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={maxPage}
            onPageChange={jump}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredInvoices.length}
          />
        )}
      </div>

      {/* Modal Nova Fatura */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gerar Nova Fatura</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
                  <select
                    value={newInvoice.clientId}
                    onChange={(e) => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Serviço</label>
                  <select
                    value={newInvoice.serviceId}
                    onChange={(e) => {
                      const svc = services.find(s => s.id === e.target.value);
                      setNewInvoice({ ...newInvoice, serviceId: e.target.value, value: svc?.baseValue || 0 });
                    }}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione um serviço...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      value={newInvoice.value}
                      onChange={(e) => setNewInvoice({ ...newInvoice, value: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vencimento</label>
                    <input
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
                <button
                  onClick={handleCreateInvoice}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
                >
                  Gerar Cobrança
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Pix (Simulação) */}
      {
        isPixModalOpen && selectedInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-center">
              <div className="p-8 space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-black text-2xl">
                    R$
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">Cobrança Pix</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">ID: #{selectedInvoice.id.substring(0, 8)}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014br.gov.bcb.pix0136pipeday-receber-exemplo-pix-123456785204000053039865405${selectedInvoice.value}5802BR5913PipeDayApp6009SaoPaulo62070503***6304`}
                    alt="Pix QR Code"
                    className={`w-48 h-48 ${isDarkMode ? 'invert brightness-90' : ''}`}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Valor total:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">R$ {selectedInvoice.value.toLocaleString('pt-BR')}</span>
                  </div>
                  <button
                    onClick={() => alert('Chave Pix copiada!')}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                  >
                    <Copy size={18} /> Copiar Chave Pix
                  </button>
                  <button
                    onClick={() => markAsPaid(selectedInvoice.id)}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    Simular Confirmação
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsPixModalOpen(false)}
                className="w-full p-4 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        )
      }

      {/* Invoice Generator Modal */}
      {
        isGeneratorOpen && selectedInvoice && (
          <InvoiceGenerator
            invoice={selectedInvoice}
            client={clients.find(c => c.id === selectedInvoice.clientId)!}
            service={services.find(s => s.id === selectedInvoice.serviceId)}
            userProfile={userProfile}
            onClose={() => setIsGeneratorOpen(false)}
          />
        )
      }
    </div >
  );
};

export default InvoicesView;
