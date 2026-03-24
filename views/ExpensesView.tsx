import React, { useState, useMemo } from 'react';
import {
  WalletCards,
  Plus,
  Search,
  Calendar,
  Tag,
  AlignLeft,
  DollarSign,
  Edit,
  Trash2,
  X,
  CreditCard,
  TrendingDown
} from 'lucide-react';
import { useData } from '../src/context/DataContext';
import { Expense } from '../types';
import { usePagination } from '../src/hooks/usePagination';
import PaginationControls from '../src/components/PaginationControls';

interface ExpensesViewProps {
  isDarkMode: boolean;
  searchQuery?: string;
}

const DEFAULT_CATEGORIES = [
  'Alimentação',
  'Marketing',
  'Internet',
  'Ferramentas',
  'Transporte',
  'Aluguel',
  'Equipamentos',
  'Outros'
];

const ExpensesView: React.FC<ExpensesViewProps> = ({ isDarkMode, searchQuery = '' }) => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState({
    category: DEFAULT_CATEGORIES[0],
    customCategory: '',
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0]
  });

  const uniqueCategories = useMemo(() => {
    const custom = expenses.map(e => e.category).filter(c => !DEFAULT_CATEGORIES.includes(c));
    return [...DEFAULT_CATEGORIES, ...Array.from(new Set(custom))];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return expenses.filter(e =>
      e.category.toLowerCase().includes(term) ||
      (e.description && e.description.toLowerCase().includes(term))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchQuery]);

  const {
    currentData: paginatedExpenses,
    currentPage,
    maxPage,
    jump,
    itemsPerPage,
    setItemsPerPage
  } = usePagination<Expense>(filteredExpenses);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTotal = expenses.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((acc, e) => acc + e.value, 0);

    const yearlyTotal = expenses.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === currentYear;
    }).reduce((acc, e) => acc + e.value, 0);

    return { monthlyTotal, yearlyTotal };
  }, [expenses]);

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      const isDefault = DEFAULT_CATEGORIES.includes(expense.category);
      setFormData({
        category: isDefault ? expense.category : 'Outra',
        customCategory: isDefault ? '' : expense.category,
        description: expense.description || '',
        value: expense.value.toString(),
        date: expense.date
      });
    } else {
      setEditingExpense(null);
      setFormData({
        category: DEFAULT_CATEGORIES[0],
        customCategory: '',
        description: '',
        value: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalCategory = formData.category === 'Outra' ? formData.customCategory : formData.category;
      if (!finalCategory.trim()) {
        alert('Por favor, informe uma categoria.');
        return;
      }
      if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
      }

      const payload = {
        category: finalCategory,
        description: formData.description,
        value: parseFloat(formData.value) || 0,
        date: formData.date
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
      } else {
        await addExpense(payload);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save expense", error);
      alert("Erro ao salvar o gasto.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este gasto?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error("Failed to delete expense", error);
        alert("Erro ao excluir o gasto.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 italic flex items-center gap-3">
            <WalletCards className="text-red-500 dark:text-red-400" size={28} />
            Gestão de Gastos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Mantenha o controle financeiro registrando suas despesas.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-md active:scale-95 border border-red-500 text-sm sm:text-base"
        >
          <Plus size={18} />
          Novo Gasto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Gasto Mensal (Atual)</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-50">
              R$ {stats.monthlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
            <TrendingDown size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Gasto Anual (Total)</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-50">
               R$ {stats.yearlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {searchQuery && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            Filtrando por: <strong>{searchQuery}</strong>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {paginatedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(expense.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <Tag size={12} />
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {expense.description || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenModal(expense)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="py-20 text-center">
              <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum gasto encontrado.</p>
            </div>
          )}
        </div>

        {filteredExpenses.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={maxPage}
            onPageChange={jump}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredExpenses.length}
          />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <WalletCards size={20} className="text-red-500" />
                {editingExpense ? 'Editar Gasto' : 'Novo Gasto'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" /> Data
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-slate-400" /> Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium text-slate-800 dark:text-slate-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Tag size={14} className="text-slate-400" /> Categoria
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Outra">Outra (Personalizada)...</option>
                  </select>
                  {formData.category === 'Outra' && (
                    <input
                      type="text"
                      required
                      placeholder="Nome da categoria"
                      value={formData.customCategory}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 text-sm font-medium text-slate-800 dark:text-slate-200"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <AlignLeft size={14} className="text-slate-400" /> Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-red-500 min-h-[100px] resize-none text-sm font-medium text-slate-800 dark:text-slate-200"
                  placeholder="Detalhes deste gasto..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-200 dark:shadow-none active:scale-95 text-sm"
                >
                  {editingExpense ? 'Salvar Alterações' : 'Cadastrar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
