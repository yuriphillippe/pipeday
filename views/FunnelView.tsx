
import React, { useState } from 'react';
import { Plus, Trash2, X, ArrowRight, Flame, Snowflake, ThermometerSun } from 'lucide-react';
import { Deal, Stage } from '../types';
import { STAGES } from '../constants';
import { useData } from '../src/context/DataContext';

interface FunnelViewProps {
  isDarkMode: boolean;
  searchQuery: string;
}

const FunnelView: React.FC<FunnelViewProps> = ({ isDarkMode, searchQuery }) => {
  const { deals, clients, services, addDeal, updateDeal, deleteDeal: contextDeleteDeal, addInvoice } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeal, setNewDeal] = useState<{
    clientId: string;
    serviceId: string;
    value: number;
    temperature: 'HOT' | 'WARM' | 'COLD';
    details: string;
  }>({
    clientId: '',
    serviceId: '',
    value: 0,
    temperature: 'WARM',
    details: ''
  });

  const [decisionModal, setDecisionModal] = useState<{ isOpen: boolean; deal: Deal | null }>({
    isOpen: false,
    deal: null
  });

  const filteredDeals = deals.filter(d => {
    if (!searchQuery) return true;

    const client = clients.find(c => c.id === d.clientId);
    const service = services.find(s => s.id === d.serviceId);
    const term = searchQuery.toLowerCase();

    const clientName = client?.name?.toLowerCase() || '';
    const serviceName = service?.name?.toLowerCase() || '';

    return clientName.includes(term) || serviceName.includes(term);
  });

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    try {
      const deal = deals.find(d => d.id === dealId);
      await updateDeal(dealId, { stage: targetStage });

      if (targetStage === 'CLOSED' && deal && deal.stage !== 'CLOSED') {
        const client = clients.find(c => c.id === deal.clientId);
        const service = services.find(s => s.id === deal.serviceId);

        await addInvoice({
          clientId: deal.clientId,
          serviceId: deal.serviceId,
          value: deal.value,
          dueDate: new Date().toISOString().split('T')[0],
          status: 'PENDING',
          pixCode: ''
        });
        alert(`Fatura gerada automaticamente para ${client?.name || 'Cliente'} em Financeiro!`);
      }
    } catch (err) {
      console.error("Failed to move deal", err);
    }
  };

  const handleAdvanceStage = async (deal: Deal) => {
    if (deal.stage === 'NEGOTIATION') {
      setDecisionModal({ isOpen: true, deal });
      return;
    }

    const stageOrder: Stage[] = ['NEW_CONTACT', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED'];
    const currentIndex = stageOrder.indexOf(deal.stage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      try {
        await updateDeal(deal.id, { stage: nextStage });
        // Invoice generation for normal flow if any, though NEGOTIATION->CLOSED is now handled by modal
      } catch (err) {
        console.error("Failed to advance deal", err);
      }
    }
  };

  const handleStageDecision = async (decision: 'CLOSED' | 'LOST') => {
    if (!decisionModal.deal) return;

    try {
      await updateDeal(decisionModal.deal.id, { stage: decision });

      if (decision === 'CLOSED') {
        const client = clients.find(c => c.id === decisionModal.deal!.clientId);
        const service = services.find(s => s.id === decisionModal.deal!.serviceId);

        await addInvoice({
          clientId: decisionModal.deal.clientId,
          serviceId: decisionModal.deal.serviceId,
          value: decisionModal.deal.value,
          dueDate: new Date().toISOString().split('T')[0],
          status: 'PENDING',
          pixCode: ''
        });
        alert(`Fatura gerada automaticamente para ${client?.name || 'Cliente'} em Financeiro!`);
      }

      setDecisionModal({ isOpen: false, deal: null });
    } catch (err) {
      console.error("Failed to update deal status", err);
      alert("Erro ao atualizar status do negócio.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCreateDeal = async () => {
    if (!newDeal.clientId || !newDeal.serviceId) return;

    try {
      await addDeal({
        clientId: newDeal.clientId,
        serviceId: newDeal.serviceId,
        value: newDeal.value || 0,
        stage: 'NEW_CONTACT',
        paymentStatus: 'PENDING',
        temperature: newDeal.temperature,
        details: newDeal.details
      });
      setIsModalOpen(false);
      setNewDeal({ clientId: '', serviceId: '', value: 0, temperature: 'WARM', details: '' });
    } catch (err) {
      console.error("Failed to create deal", err);
      alert("Erro ao criar negócio.");
    }
  };

  const handleDeleteDeal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja remover este negócio?')) {
      try {
        await contextDeleteDeal(id);
      } catch (error) {
        console.error(error);
        alert("Erro ao excluir negócio");
      }
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Funil de Vendas</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie o progresso das suas negociações.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Negócio
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full">
          {STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
            const totalValue = stageDeals.reduce((acc, curr) => acc + curr.value, 0);

            return (
              <div
                key={stage.id}
                className="flex-1 min-w-[250px] flex flex-col"
                onDrop={(e) => handleDrop(e, stage.id)}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.color.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{stage.label}</h3>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full font-bold">
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    R$ {totalValue.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-4 border-2 border-dashed border-slate-200 dark:border-slate-800 min-h-[500px]">
                  {stageDeals.map((deal) => {
                    const client = clients.find(c => c.id === deal.clientId);
                    const service = services.find(s => s.id === deal.serviceId);

                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-[150px]">
                              {client?.name || 'Cliente Desconhecido'}
                            </p>
                            {deal.temperature && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {deal.temperature === 'HOT' && <Flame size={12} className="text-red-500 fill-red-500" />}
                                {deal.temperature === 'WARM' && <ThermometerSun size={12} className="text-orange-500" />}
                                {deal.temperature === 'COLD' && <Snowflake size={12} className="text-blue-500" />}
                                <span className={`text-[10px] font-bold ${deal.temperature === 'HOT' ? 'text-red-600' :
                                  deal.temperature === 'WARM' ? 'text-orange-600' : 'text-blue-600'
                                  }`}>
                                  {deal.temperature === 'HOT' ? 'Quente' : deal.temperature === 'WARM' ? 'Morno' : 'Frio'}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={(e) => handleAdvanceStage(deal)}
                              className={`p-1 text-slate-300 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-all opacity-0 group-hover:opacity-100 ${deal.stage === 'CLOSED' || deal.stage === 'LOST' ? 'hidden' : ''}`}
                              title="Avançar Etapa"
                            >
                              <ArrowRight size={14} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteDeal(deal.id, e)}
                              className="p-1 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">{service?.name || 'Serviço Personalizado'}</p>

                        {deal.details && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg mb-3 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2" title={deal.details}>
                              {deal.details}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            <span className="text-xs">R$</span>
                            {deal.value.toLocaleString('pt-BR')}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                            {client?.name ? client.name.substring(0, 2).toUpperCase() : '??'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Novo Negócio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Novo Negócio</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
                <select
                  value={newDeal.clientId}
                  onChange={(e) => setNewDeal({ ...newDeal, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Serviço</label>
                <select
                  value={newDeal.serviceId}
                  onChange={(e) => {
                    const svc = services.find(s => s.id === e.target.value);
                    setNewDeal({ ...newDeal, serviceId: e.target.value, value: svc?.baseValue || 0 });
                  }}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione um serviço...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor do Negócio (R$)</label>
                <input
                  type="number"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temperatura do Lead</label>
                <div className="flex gap-2">
                  {(['HOT', 'WARM', 'COLD'] as const).map((temp) => (
                    <button
                      key={temp}
                      onClick={() => setNewDeal({ ...newDeal, temperature: temp })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${newDeal.temperature === temp
                        ? temp === 'HOT' ? 'bg-red-50 text-red-600 border-red-200'
                          : temp === 'WARM' ? 'bg-orange-50 text-orange-600 border-orange-200'
                            : 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      {temp === 'HOT' ? 'QUENTE 🔥' : temp === 'WARM' ? 'MORNO ☀️' : 'FRIO ❄️'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detalhes / Observações</label>
                <textarea
                  rows={2}
                  value={newDeal.details}
                  onChange={(e) => setNewDeal({ ...newDeal, details: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Cliente prefere contato via WhatsApp..."
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400">Cancelar</button>
              <button
                onClick={handleCreateDeal}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
              >
                Criar Negócio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Decisão Fechado/Perdido */}
      {decisionModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Finalizar Negociação</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">O negócio foi fechado com sucesso ou perdido?</p>

            <div className="flex gap-3">
              <button
                onClick={() => handleStageDecision('LOST')}
                className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
              >
                Perdido
              </button>
              <button
                onClick={() => handleStageDecision('CLOSED')}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-colors flex flex-col items-center justify-center gap-0.5"
              >
                <span>Fechado</span>
                <span className="text-[10px] font-normal opacity-90">(Gerar Fatura)</span>
              </button>
            </div>
            <button onClick={() => setDecisionModal({ isOpen: false, deal: null })} className="mt-4 text-xs text-slate-400 hover:text-slate-600 uppercase font-bold tracking-widest">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunnelView;
