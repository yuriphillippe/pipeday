import React, { useMemo } from 'react';
import { 
  BarChart4, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle,
  Download,
  FileText,
  FileSpreadsheet,
  Database,
  Pencil,
  Check
} from 'lucide-react';
import { useData } from '../context/DataContext';

declare global {
  interface Window {
    jspdf: any;
    XLSX: any;
  }
}

interface FiscalViewProps {
  isDarkMode: boolean;
}

const MEI_LIMIT = 81000;
const MEI_ALERT_LEVEL_1 = MEI_LIMIT * 0.6; // 48.600
const MEI_ALERT_LEVEL_2 = MEI_LIMIT * 0.8; // 64.800
const MEI_ALERT_LEVEL_3 = MEI_LIMIT * 0.95; // 76.950

type TaxRegime = 'MEI' | 'SIMPLES_NACIONAL' | 'PROFISSIONAL_LIBERAL';

const FiscalView: React.FC<FiscalViewProps> = ({ isDarkMode }) => {
  const { invoices, clients } = useData();

  // Settings State
  const [taxRegime, setTaxRegime] = React.useState<TaxRegime>(() => {
    return (localStorage.getItem('pipeday_tax_regime') as TaxRegime) || 'MEI';
  });
  const [fixedMeiTax, setFixedMeiTax] = React.useState<number>(() => {
    return Number(localStorage.getItem('pipeday_mei_tax')) || 71.0;
  });
  const [taxRatePercentage, setTaxRatePercentage] = React.useState<number>(() => {
    return Number(localStorage.getItem('pipeday_tax_rate')) || 6.0;
  });

  const [isEditingTax, setIsEditingTax] = React.useState(false);
  const [tempTaxValue, setTempTaxValue] = React.useState('');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Metrics Calculation
  const metrics = useMemo(() => {
    let monthlyRevenue = 0;
    let accumulatedRevenue = 0;
    let totalSales = 0;

    invoices.forEach(inv => {
      // Only consider PAID invoices
      if (inv.status === 'PAID') {
        const invDate = inv.createdAt && !isNaN(new Date(inv.createdAt).getTime()) ? new Date(inv.createdAt) : null;
        
        if (invDate) {
          const isCurrentYear = invDate.getFullYear() === currentYear;
          const isCurrentMonth = invDate.getMonth() === currentMonth;

          if (isCurrentYear) {
               accumulatedRevenue += inv.value;
               totalSales += 1;
            
               if (isCurrentMonth) {
                  monthlyRevenue += inv.value;
               }
          }
        }
      }
    });

    const averageTicket = totalSales > 0 ? accumulatedRevenue / totalSales : 0;

    return { monthlyRevenue, accumulatedRevenue, totalSales, averageTicket };
  }, [invoices, currentMonth, currentYear]);

  // Alert Level Calculation
  const getAlertStatus = (revenue: number) => {
    if (revenue >= MEI_ALERT_LEVEL_3) {
        return { level: 3, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', message: 'Risco de ultrapassar o limite do MEI.' };
    }
    if (revenue >= MEI_ALERT_LEVEL_2) {
        return { level: 2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', message: 'Atenção! Você está próximo do limite anual do MEI.' };
    }
    if (revenue >= MEI_ALERT_LEVEL_1) {
        return { level: 1, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', message: 'Você já faturou 60% do limite anual do MEI.' };
    }
    return { level: 0, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', message: 'Faturamento dentro do limite seguro.' };
  };

  const alertStatus = getAlertStatus(metrics.accumulatedRevenue);
  const progressPercentage = Math.min((metrics.accumulatedRevenue / MEI_LIMIT) * 100, 100);

  // Export Functions
  const generateCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Relatorio Fiscal / Contabil - " + new Date().toLocaleDateString('pt-BR') + "\n\n";
      csvContent += "--- FATURAMENTO ---\n";
      csvContent += "Receita Mensal (R$)," + metrics.monthlyRevenue.toFixed(2) + "\n";
      csvContent += "Receita Acumulada Anual (R$)," + metrics.accumulatedRevenue.toFixed(2) + "\n";
      csvContent += "Quantidade de Vendas," + metrics.totalSales + "\n";
      csvContent += "Ticket Medio (R$)," + metrics.averageTicket.toFixed(2) + "\n\n";

      csvContent += "--- CLIENTES ---\n";
      csvContent += "Nome,Email,WhatsApp,Data Cadastro\n";
      clients.forEach(c => {
         const date = c.createdAt && !isNaN(new Date(c.createdAt).getTime()) ? new Date(c.createdAt).toLocaleDateString('pt-BR') : 'N/A';
         csvContent += `"${c.name}","${c.email || ''}","${c.whatsapp || ''}","${date}"\n`;
      });
      csvContent += "\n";

      csvContent += "--- PAGAMENTOS CONFIRMADOS ---\n";
      csvContent += "Cliente,Valor (R$),Data Pagamento,Status\n";
      const paidInvoices = invoices.filter(i => i.status === 'PAID');
      paidInvoices.forEach(inv => {
         const client = clients.find(c => c.id === inv.clientId);
         const clientName = client ? client.name : 'Desconhecido';
         const date = inv.createdAt && !isNaN(new Date(inv.createdAt).getTime()) ? new Date(inv.createdAt).toLocaleDateString('pt-BR') : 'N/A';
         csvContent += `"${clientName}",${inv.value.toFixed(2)},"${date}","Pago"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `relatorio_fiscal_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link); 
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error generating CSV:", e);
      alert("Erro ao gerar o arquivo CSV.");
    }
  };

  const generatePDF = () => {
    if (!window.jspdf) {
        alert("O script PDF ainda está carregando. Tente novamente em alguns segundos.");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF() as any;

    doc.setFontSize(18);
    doc.text("Relatório Fiscal / Contábil", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    doc.text(`Regime Tributário: ${taxRegime.replace('_', ' ')}`, 14, 36);
    
    // Faturamento Table
    doc.autoTable({
        startY: 45,
        head: [['Métrica', 'Valor']],
        body: [
            ['Receita do Mês', `R$ ${metrics.monthlyRevenue.toFixed(2)}`],
            ['Receita Acumulada Anual', `R$ ${metrics.accumulatedRevenue.toFixed(2)}`],
            ['Quantidade de Vendas', metrics.totalSales.toString()],
            ['Ticket Médio', `R$ ${metrics.averageTicket.toFixed(2)}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] } // indigo-600
    });

    // Pagamentos Table
    doc.text("Pagamentos Confirmados", 14, doc.lastAutoTable.finalY + 15);
    const paidInvoices = invoices.filter(i => i.status === 'PAID');
    const paymentBody = paidInvoices.map(inv => {
        const client = clients.find(c => c.id === inv.clientId);
        const date = inv.createdAt && !isNaN(new Date(inv.createdAt).getTime()) ? new Date(inv.createdAt).toLocaleDateString('pt-BR') : 'N/A';
        return [client?.name || 'Desconhecido', `R$ ${inv.value.toFixed(2)}`, date, 'Pago'];
    });

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Cliente', 'Valor', 'Data Pagamento', 'Status']],
        body: paymentBody,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] } // emerald-500
    });

    doc.save(`relatorio_fiscal_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateExcel = () => {
    if (!window.XLSX) {
        alert("O script Excel ainda está carregando. Tente novamente.");
        return;
    }

    const wb = window.XLSX.utils.book_new();

    // Sheet 1: Resumo
    const summaryData = [
        ["Relatório Fiscal / Contábil"],
        ["Data de Geração", new Date().toLocaleDateString('pt-BR')],
        ["Regime Tributário", taxRegime.replace('_', ' ')],
        [],
        ["Métrica", "Valor"],
        ["Receita do Mês", metrics.monthlyRevenue],
        ["Receita Acumulada Anual", metrics.accumulatedRevenue],
        ["Quantidade de Vendas", metrics.totalSales],
        ["Ticket Médio", metrics.averageTicket]
    ];
    const wsSummary = window.XLSX.utils.aoa_to_sheet(summaryData);
    window.XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");

    // Sheet 2: Pagamentos
    const paidInvoices = invoices.filter(i => i.status === 'PAID');
    const paymentsData = [
        ["Cliente", "Valor Total", "Data", "Status"]
    ];
    paidInvoices.forEach(inv => {
        const client = clients.find(c => c.id === inv.clientId);
        const date = inv.createdAt && !isNaN(new Date(inv.createdAt).getTime()) ? new Date(inv.createdAt).toLocaleDateString('pt-BR') : 'N/A';
        paymentsData.push([client?.name || 'Desconhecido', inv.value as any, date, 'Pago']);
    });
    
    const wsPayments = window.XLSX.utils.aoa_to_sheet(paymentsData);
    window.XLSX.utils.book_append_sheet(wb, wsPayments, "Pagamentos");

    window.XLSX.writeFile(wb, `relatorio_fiscal_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSaveTax = () => {
    const val = parseFloat(tempTaxValue.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
        if (taxRegime === 'MEI') {
            setFixedMeiTax(val);
            localStorage.setItem('pipeday_mei_tax', val.toString());
        } else {
            setTaxRatePercentage(val);
            localStorage.setItem('pipeday_tax_rate', val.toString());
        }
    }
    setIsEditingTax(false);
  };

  const currentEstimatedTax = taxRegime === 'MEI' ? fixedMeiTax : (metrics.monthlyRevenue * taxRatePercentage / 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 italic flex items-center gap-3">
            <BarChart4 className="text-indigo-600 dark:text-indigo-400" size={28} />
            Fiscal / Contábil
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Acompanhe seu faturamento e limites do MEI.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button
                onClick={generatePDF}
                className="flex-1 sm:flex-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm text-sm"
            >
                <FileText size={16} className="text-red-500" />
                PDF
            </button>
            <button
                 onClick={generateExcel}
                className="flex-1 sm:flex-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm text-sm"
            >
                <FileSpreadsheet size={16} className="text-emerald-500" />
                Excel
            </button>
            <button
                onClick={generateCSV}
                className="flex-1 sm:flex-none bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md active:scale-95 text-sm"
            >
                <Database size={16} />
                Exportar CSV
            </button>
        </div>
      </div>

      {/* Tax configuration bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">Regime Tributário:</span>
              <select 
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  value={taxRegime}
                  onChange={(e) => {
                      const val = e.target.value as TaxRegime;
                      setTaxRegime(val);
                      localStorage.setItem('pipeday_tax_regime', val);
                  }}
              >
                  <option value="MEI">Microempreendedor Individual (MEI)</option>
                  <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                  <option value="PROFISSIONAL_LIBERAL">Profissional Liberal / Autônomo</option>
              </select>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
              {taxRegime === 'MEI' 
                  ? 'Limites e DAS prefixados baseados nas regras vigentes do MEI.' 
                  : 'Cálculo dinâmico baseado no faturamento e alíquota estimada.'}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Receita do Mês */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
                    <DollarSign size={20} />
                </div>
                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Receita do Mês</p>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
                R$ {metrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
        </div>

        {/* Receita Acumulada */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <TrendingUp size={20} />
                </div>
                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Receita Acumulada</p>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
                R$ {metrics.accumulatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Neste ano</p>
        </div>

        {/* Quantidade de Vendas */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                    <ShoppingBag size={20} />
                </div>
                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vendas Concluídas</p>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
                {metrics.totalSales}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Faturas pagas no ano</p>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400">
                    <BarChart4 size={20} />
                </div>
                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ticket Médio</p>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
                R$ {metrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerta MEI / Faturamento Anual */}
          {taxRegime === 'MEI' ? (
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <AlertTriangle size={18} />
                        </div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Monitor MEI</h3>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Faturamento Anual</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-slate-50">
                                R$ {metrics.accumulatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                <span className="text-sm font-medium text-slate-400 ml-2">/ R$ {MEI_LIMIT.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ease-out flex items-center justify-end px-2 ${
                                alertStatus.level === 3 ? 'bg-red-500' :
                                alertStatus.level === 2 ? 'bg-amber-500' :
                                alertStatus.level === 1 ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                        >
                            {progressPercentage >= 15 && <span className="text-[10px] font-bold text-white max-w-full overflow-hidden text-clip whitespace-nowrap">{progressPercentage.toFixed(1)}%</span>}
                        </div>
                    </div>

                    {/* Message Box */}
                    <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${alertStatus.bg} ${alertStatus.border} ${alertStatus.color}`}>
                        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-sm">Status: {
                                 alertStatus.level === 3 ? '🔴 Risco' :
                                 alertStatus.level === 2 ? '🟡 Alerta' :
                                 alertStatus.level === 1 ? '🟢 Atenção' : '🟢 Seguro'
                            }</p>
                            <p className="text-xs font-medium mt-1 opacity-90">{alertStatus.message}</p>
                        </div>
                    </div>
                 </div>
              </div>
          ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <TrendingUp size={18} />
                        </div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Faturamento Anual</h3>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Total acumulado no ano vigente</p>
                        <p className="text-4xl font-black text-slate-900 dark:text-slate-50 mt-2">
                            R$ {metrics.accumulatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-sm text-indigo-800 dark:text-indigo-300 text-center font-medium">
                            Continue registrando faturas pagas para manter seu relatório consistente e evitar surpresas no fechamento contábil.
                        </p>
                    </div>
                 </div>
              </div>
          )}

          {/* Estimativa de Imposto */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                        <FileText size={18} />
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Estimativa de Impostos ({taxRegime.replace('_', ' ')})</h3>
                </div>
             </div>

             <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                 <div className="space-y-4">
                     <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                         <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Faturamento Mensal</span>
                         <span className="text-lg font-black text-slate-900 dark:text-slate-50">
                             R$ {metrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </span>
                     </div>
                     <div className="flex justify-between items-center pt-2">
                         <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                 {taxRegime === 'MEI' ? 'DAS (Fixo)' : 'Imposto Estimado (Variável)'}
                             </span>
                             {/* Editable Tax Rate / Value block */}
                             <div className="mt-1 flex items-center gap-2">
                                 {isEditingTax ? (
                                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-1 rounded-md">
                                        <input 
                                            type="text" 
                                            autoFocus
                                            className="w-16 outline-none bg-transparent text-xs font-medium px-1 text-slate-800 dark:text-slate-200" 
                                            value={tempTaxValue}
                                            onChange={(e) => setTempTaxValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTax()}
                                        />
                                        <span className="text-xs text-slate-400">{taxRegime === 'MEI' ? 'R$' : '%'}</span>
                                        <button onClick={handleSaveTax} className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"><Check size={14}/></button>
                                    </div>
                                 ) : (
                                    <button 
                                        onClick={() => {
                                            setTempTaxValue(taxRegime === 'MEI' ? fixedMeiTax.toString() : taxRatePercentage.toString());
                                            setIsEditingTax(true);
                                        }}
                                        className="text-[10px] flex items-center gap-1 font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        <Pencil size={10} />
                                        Editar {taxRegime === 'MEI' ? 'Valor' : 'Alíquota'}
                                    </button>
                                 )}
                                 {!isEditingTax && taxRegime !== 'MEI' && (
                                     <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                                         {taxRatePercentage}%
                                     </span>
                                 )}
                             </div>
                         </div>
                         <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                            R$ {currentEstimatedTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </span>
                     </div>
                 </div>
                 
                 <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 text-center italic">
                     {taxRegime === 'MEI' 
                        ? '*O valor referente ao DAS MEI é fixo mensalmente, e pode ser atualizado por você de acordo com reajustes anuais.' 
                        : '*Esta é apenas uma estimativa financeira interna baseada na alíquota informada. Consulte seu contador para as guias oficiais.'}
                 </p>
             </div>
          </div>
      </div>
    </div>
  );
};

export default FiscalView;
