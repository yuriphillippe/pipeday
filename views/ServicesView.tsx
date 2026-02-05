
import React, { useState } from 'react';
import { Plus, Briefcase, Clock, Trash2, Edit, X, LayoutGrid, List, Search } from 'lucide-react';
import { Service } from '../types';
import { useData } from '../src/context/DataContext';
import { usePagination } from '../src/hooks/usePagination';
import PaginationControls from '../src/components/PaginationControls';

interface ServicesViewProps {
  isDarkMode: boolean;
  searchQuery: string;
}

const ServicesView: React.FC<ServicesViewProps> = ({ isDarkMode, searchQuery }) => {
  const { services, addService, updateService, deleteService } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState({
    name: '',
    baseValue: 0,
    type: 'UNIQUE' as 'UNIQUE' | 'MONTHLY',
    observations: ''
  });


  const filteredServices = services.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.observations?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const {
    currentData: paginatedServices,
    currentPage,
    maxPage,
    jump,
    itemsPerPage,
    setItemsPerPage
  } = usePagination<Service>(filteredServices);

  const handleSave = async () => {
    if (!formData.name) return;

    try {
      if (editingService) {
        await updateService(editingService.id, formData);
      } else {
        await addService({
          name: formData.name,
          baseValue: formData.baseValue,
          type: formData.type,
          observations: formData.observations
        });
      }
      closeModal();
    } catch {
      alert("Erro ao salvar serviço.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ name: '', baseValue: 0, type: 'UNIQUE', observations: '' });
  };

  const handleEdit = (svc: Service) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      baseValue: svc.baseValue,
      type: svc.type,
      observations: svc.observations
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este serviço?')) {
      try {
        await deleteService(id);
      } catch {
        alert("Erro ao excluir serviço.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Biblioteca de Serviços</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Padronize seus serviços para agilizar propostas.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}
            >
              <List size={18} />
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Novo Serviço
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedServices.map((service) => (
            <div key={service.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Briefcase size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(service)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(service.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{service.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex-1 line-clamp-2">{service.observations || 'Nenhuma observação.'}</p>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                  <span className="text-xs">R$</span>
                  <span>{service.baseValue.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <Clock size={14} />
                  {service.type === 'UNIQUE' ? 'Único' : 'Mensal'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Serviço</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Valor Base</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedServices.map(service => (
                <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">{service.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${service.type === 'UNIQUE' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'}`}>
                      {service.type === 'UNIQUE' ? 'ÚNICO' : 'MENSAL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">R$ {service.baseValue.toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(service)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(service.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredServices.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={maxPage}
          onPageChange={jump}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={filteredServices.length}
        />
      )}

      {/* Modal Serviço */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button onClick={closeModal} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Serviço</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Consultoria em Marketing"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor Base (R$)</label>
                  <input
                    type="number"
                    value={formData.baseValue}
                    onChange={(e) => setFormData({ ...formData, baseValue: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Cobrança</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="UNIQUE">Pagamento Único</option>
                    <option value="MONTHLY">Recorrência Mensal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Descreva o que está incluso..."
                ></textarea>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
              >
                Salvar Serviço
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesView;
