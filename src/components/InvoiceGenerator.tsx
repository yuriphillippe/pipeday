
import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Plus, Trash2, FileText } from 'lucide-react';
import { Invoice, Client, Service } from '../../types';

interface InvoiceGeneratorProps {
    invoice: Invoice;
    client: Client;
    service?: Service;
    onClose: () => void;
    userProfile: { name: string; email: string; pixKey?: string };
}

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ invoice, client, service, onClose, userProfile }) => {
    const [zoom, setZoom] = useState(0.7);

    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const [companyDetails, setCompanyDetails] = useState({
        name: userProfile?.name || 'Minha Empresa',
        nif: '00.000.000/0001-00',
        address: 'Seu Endereço Completo',
        email: userProfile?.email || 'contato@empresa.com'
    });

    const [clientDetails, setClientDetails] = useState({
        name: client.name,
        company: client.companyName || '',
        email: client.email || '',
        phone: client.whatsapp || ''
    });

    const [invoiceDetails, setInvoiceDetails] = useState({
        number: invoice.id.substring(0, 8).toUpperCase(),
        issueDate: invoice.createdAt,
        dueDate: invoice.dueDate
    });

    const [items, setItems] = useState<InvoiceItem[]>(
        service ? [{
            id: '1',
            description: service.name,
            quantity: 1,
            unitPrice: invoice.value || service.baseValue
        }] : [{
            id: '1',
            description: 'Item Exemplo',
            quantity: 1,
            unitPrice: invoice.value
        }]
    );

    const handleAddItem = () => {
        setItems([...items, {
            id: Math.random().toString(36).substr(2, 9),
            description: 'Novo Item',
            quantity: 1,
            unitPrice: 0
        }]);
    };

    const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const calculateSubtotal = () => {
        return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal();
    };

    const downloadPDF = async () => {
        if (!invoiceRef.current) return;

        // Save current styles to restore after generation
        const originalTransform = invoiceRef.current.style.transform;
        const originalMargin = invoiceRef.current.style.margin;

        setIsGenerating(true);

        try {
            // Reset scale for capture to ensure high quality A4 size
            invoiceRef.current.style.transform = 'scale(1)';
            invoiceRef.current.style.margin = '0 auto'; // Center it for capture if needed, though html2canvas captures element directly

            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 210 * 3.78, // Approximate pixel width of A4 at 96DPI (roughly 794px) to ensure media queries behave?
                // Actually defaulting is usually fine if we remove the scale transform
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;

            const finalHeight = pdfWidth / ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);
            pdf.save(`Fatura_${invoiceDetails.number}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            // Restore functionality
            if (invoiceRef.current) {
                invoiceRef.current.style.transform = originalTransform;
                invoiceRef.current.style.margin = originalMargin;
            }
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-slate-200 dark:bg-slate-800 w-full max-w-7xl h-[95vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-700">

                {/* Sidebar Controls */}
                <div className="w-full md:w-80 bg-white dark:bg-slate-900 p-6 flex flex-col gap-6 border-r border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 z-10 shadow-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <FileText className="text-indigo-600" />
                            Editor
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Zoom Controls */}
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Zoom</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">-</button>
                                <span className="text-sm font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                                <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">+</button>
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                            <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2">Dados da Empresa</h3>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={companyDetails.name}
                                    onChange={e => setCompanyDetails({ ...companyDetails, name: e.target.value })}
                                    className="w-full text-xs p-2 rounded border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800"
                                    placeholder="Nome da Empresa"
                                />
                                <input
                                    type="text"
                                    value={companyDetails.nif}
                                    onChange={e => setCompanyDetails({ ...companyDetails, nif: e.target.value })}
                                    className="w-full text-xs p-2 rounded border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800"
                                    placeholder="CNPJ / NIF"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAddItem}
                            className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Adicionar Item
                        </button>

                        <button
                            onClick={downloadPDF}
                            disabled={isGenerating}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {isGenerating ? 'Gerando...' : <><Download size={20} /> Baixar PDF</>}
                        </button>
                    </div>

                    <div className="mt-auto text-xs text-slate-400 text-center">
                        <p>Edite os textos clicando na pré-visualização.</p>
                    </div>
                </div>

                {/* Invoice Preview (A4 Canvas) */}
                <div className="flex-1 bg-slate-500/10 dark:bg-black/20 overflow-auto p-8 relative flex items-start justify-center">
                    <div
                        ref={invoiceRef}
                        className="bg-white text-slate-900 shadow-2xl mx-auto flex flex-col relative transition-transform duration-200 ease-out origin-top"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            fontFamily: "'Inter', sans-serif",
                            transform: `scale(${zoom})`,
                            marginBottom: `${(297 * zoom) - 297}mm` // Adjust margin to prevent excessive whitespace below when scaled down
                        }}
                    >
                        {/* Header */}
                        <div className="p-12 bg-slate-50 border-b border-slate-100 flex justify-between">
                            <div>
                                <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-2xl mb-4">
                                    {companyDetails.name.substring(0, 1)}
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900">{companyDetails.name}</h1>
                                <p className="text-slate-500 text-sm mt-1 w-64">{companyDetails.address}</p>
                                <p className="text-slate-500 text-sm">{companyDetails.email}</p>
                                <p className="text-slate-500 text-sm">CNPJ: {companyDetails.nif}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-black text-slate-200 uppercase tracking-widest">Fatura</h2>
                                <div className="mt-6 space-y-1">
                                    <p className="text-sm font-bold text-slate-600">Fatura Nº</p>
                                    <p className="text-lg font-bold text-slate-900 mb-2">#{invoiceDetails.number}</p>

                                    <p className="text-sm font-bold text-slate-600">Data de Emissão</p>
                                    <p className="text-slate-900">{new Date(invoiceDetails.issueDate).toLocaleDateString('pt-BR')}</p>

                                    <p className="text-sm font-bold text-slate-600 mt-2">Data de Vencimento</p>
                                    <p className="text-slate-900">{new Date(invoiceDetails.dueDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="p-12 pb-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Faturado Para</h3>
                            <div className="text-slate-800">
                                <h2 className="text-xl font-bold">{clientDetails.name}</h2>
                                {clientDetails.company && <p className="text-lg text-slate-600">{clientDetails.company}</p>}
                                <p className="text-slate-500 mt-2">{clientDetails.email}</p>
                                <p className="text-slate-500">{clientDetails.phone}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="p-12 pt-0 flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-4 w-1/2">Descrição</th>
                                        <th className="py-4 text-center">Qtd</th>
                                        <th className="py-4 text-right">Preço Unit.</th>
                                        <th className="py-4 text-right">Total</th>
                                        <th className="py-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item) => (
                                        <tr key={item.id} className="group">
                                            <td className="py-4">
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                                    className="w-full bg-transparent outline-none font-medium text-slate-800 placeholder-slate-300"
                                                    placeholder="Descrição do item"
                                                />
                                            </td>
                                            <td className="py-4 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value))}
                                                    className="w-12 text-center bg-transparent outline-none text-slate-600"
                                                />
                                            </td>
                                            <td className="py-4 text-right">
                                                <input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                                                    className="w-24 text-right bg-transparent outline-none text-slate-600"
                                                />
                                            </td>
                                            <td className="py-4 text-right font-bold text-slate-800">
                                                R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 text-center">
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end mt-8 border-t border-slate-100 pt-8">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-slate-500 text-sm">
                                        <span>Subtotal</span>
                                        <span>R$ {calculateSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 text-sm">
                                        <span>Impostos (0%)</span>
                                        <span>R$ 0,00</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-indigo-600 pt-4 border-t border-slate-100">
                                        <span>Total</span>
                                        <span>R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-12 bg-slate-50 border-t border-slate-100 mt-auto">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-2">Termos de Pagamento</h4>
                                    <p className="text-xs text-slate-500 max-w-sm">
                                        Pagamento deve ser realizado em até 5 dias após o vencimento.
                                        Chave Pix: {userProfile.pixKey || companyDetails.email}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-serif italic text-slate-400">Obrigado pela preferência!</p>
                                    <p className="text-xs text-slate-300 mt-1">Gerado via PipeDay</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceGenerator;
