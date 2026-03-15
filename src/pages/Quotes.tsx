import React, { useState, useRef, useMemo } from 'react';
import { useStore, QuoteItem, Quote } from '../store';
import { Upload, Plus, Trash2, Save, FileSpreadsheet, CheckCircle, Clock, XCircle, FileText, Download, Eye, ArrowLeft, Send, Printer, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { generatePdf } from '../utils/pdfGenerator';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';

export default function Quotes() {
  const { clients, quotes, products, addQuote, updateQuote, deleteQuote, addReceipt, companyLogo, companyData, companySignature } = useStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteToPrint, setQuoteToPrint] = useState<Quote | null>(null);

  const approvedQuotes = quotes.filter(q => q.status === 'APPROVED');
  const pendingQuotes = quotes.filter(q => q.status === 'DRAFT' || q.status === 'SENT');
  const rejectedQuotes = quotes.filter(q => q.status === 'REJECTED');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedItems: QuoteItem[] = results.data.map((row: any) => {
          // Try to guess columns
          const descKey = Object.keys(row).find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('prod') || k.toLowerCase().includes('nome'));
          const qtyKey = Object.keys(row).find(k => k.toLowerCase().includes('qtd') || k.toLowerCase().includes('quant'));
          const priceKey = Object.keys(row).find(k => k.toLowerCase().includes('preco') || k.toLowerCase().includes('preço') || k.toLowerCase().includes('valor') || k.toLowerCase().includes('unit'));

          const description = descKey ? row[descKey] : Object.values(row)[0] as string;
          const quantity = qtyKey ? parseFloat(row[qtyKey]) : 1;
          
          let unitPrice = 0;
          if (priceKey) {
            const priceStr = String(row[priceKey]).replace(/[R$\s]/g, '').replace(',', '.');
            unitPrice = parseFloat(priceStr);
          }

          return {
            id: uuidv4(),
            description: description || 'Produto sem nome',
            quantity: isNaN(quantity) ? 1 : quantity,
            unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
            total: (isNaN(quantity) ? 1 : quantity) * (isNaN(unitPrice) ? 0 : unitPrice)
          };
        });

        setItems(prev => [...prev, ...parsedItems]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addItem = () => {
    setItems([...items, { id: uuidv4(), description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const totalValue = items.reduce((sum, item) => sum + item.total, 0);

  const handleSave = () => {
    if (!clientId) {
      alert('Selecione um cliente');
      return;
    }
    if (items.length === 0) {
      alert('Adicione pelo menos um item');
      return;
    }

    addQuote({
      clientId,
      date: new Date().toISOString(),
      items,
      totalValue,
      status: 'DRAFT'
    });

    alert('Orçamento salvo com sucesso!');
    setClientId('');
    setItems([]);
    setIsCreating(false);
  };

  const handleStatusChange = (quote: Quote, newStatus: Quote['status']) => {
    updateQuote(quote.id, { ...quote, status: newStatus });
    
    // If approved, automatically create a receipt
    if (newStatus === 'APPROVED' && quote.status !== 'APPROVED') {
      addReceipt({
        clientId: quote.clientId,
        date: new Date().toISOString().split('T')[0],
        value: quote.totalValue,
        description: `Referente ao orçamento aprovado #${quote.id.substring(0, 8)}`
      });
      alert('Orçamento aprovado! Uma receita foi gerada automaticamente na aba Financeiro.');
    }
  };

  const handleDownloadPdf = async (quote: Quote) => {
    setQuoteToPrint(quote);
    setIsGenerating(true);
    
    // Wait for state to update and DOM to render
    setTimeout(async () => {
      const element = printRef.current;
      if (!element) {
        setIsGenerating(false);
        setQuoteToPrint(null);
        alert('Erro: Template do PDF não encontrado.');
        return;
      }

      try {
        const client = clients.find(c => c.id === quote.clientId);
        const safeName = client?.name.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_') || 'Cliente';
        const dateStr = new Date(quote.date).toLocaleDateString('pt-BR').replace(/\//g, '-');
        const fileName = `Orcamento_${safeName}_${dateStr}.pdf`;

        await generatePdf(element, fileName);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert(`Erro ao gerar PDF. Tente usar o botão "Imprimir" como alternativa.`);
      } finally {
        setIsGenerating(false);
        setQuoteToPrint(null);
      }
    }, 1500); // Increased timeout for safety
  };

  const handlePrintQuote = (quote: Quote) => {
    setQuoteToPrint(quote);
    setTimeout(() => {
      window.print();
      setQuoteToPrint(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" fillOpacity="0.1" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="white" fillOpacity="0.05" />
        </svg>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-[#004a7c]/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white font-black uppercase tracking-widest text-sm">Gerando Documento de Alta Qualidade...</p>
          <p className="text-white/60 text-xs mt-2">Isso pode levar alguns segundos</p>
        </div>
      )}
      <AnimatePresence mode="wait">
        {!isCreating ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto relative z-10"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
              <div>
                <h1 className="text-6xl font-light tracking-tight">Orçamentos</h1>
                <p className="text-xl opacity-60 mt-2 font-light">Propostas comerciais e faturamento</p>
              </div>
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all group"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" /> 
                <span className="text-lg font-medium">Novo Orçamento</span>
              </button>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/10 text-white rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-light">{quotes.length}</span>
                </div>
                <h3 className="text-white/60 font-medium uppercase tracking-wider text-xs">Total de Orçamentos</h3>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-light">{approvedQuotes.length}</span>
                </div>
                <h3 className="text-white/60 font-medium uppercase tracking-wider text-xs">Aprovados</h3>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 text-orange-400 rounded-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-light">{pendingQuotes.length}</span>
                </div>
                <h3 className="text-white/60 font-medium uppercase tracking-wider text-xs">Aguardando Aprovação</h3>
              </div>
            </div>

            {/* Quotes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {quotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(quote => {
                const client = clients.find(c => c.id === quote.clientId);
                
                const statusColors = {
                  DRAFT: 'bg-white/10 text-white/60',
                  SENT: 'bg-blue-500/20 text-blue-300',
                  APPROVED: 'bg-emerald-500/20 text-emerald-300',
                  REJECTED: 'bg-red-500/20 text-red-300'
                };

                return (
                  <motion.div
                    key={quote.id}
                    whileHover={{ y: -4 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between min-h-[240px] group transition-all hover:bg-white/10"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[quote.status]}`}>
                          {quote.status === 'DRAFT' ? 'Rascunho' :
                           quote.status === 'SENT' ? 'Enviado' :
                           quote.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}
                        </span>
                        <span className="text-xs text-white/40">
                          {new Date(quote.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-1" title={client?.name || 'Cliente Desconhecido'}>
                        {client?.name || 'Cliente Desconhecido'}
                      </h3>
                      <p className="text-xs text-white/30 mb-4 font-mono">#{quote.id.substring(0, 8)}</p>
                      <p className="text-3xl font-light text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.totalValue)}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <select 
                        value={quote.status}
                        onChange={(e) => handleStatusChange(quote, e.target.value as Quote['status'])}
                        className="text-xs bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1.5 outline-none focus:border-white/30"
                      >
                        <option value="DRAFT" className="bg-[#004a7c]">Rascunho</option>
                        <option value="SENT" className="bg-[#004a7c]">Enviado</option>
                        <option value="APPROVED" className="bg-[#004a7c]">Aprovado</option>
                        <option value="REJECTED" className="bg-[#004a7c]">Rejeitado</option>
                      </select>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setViewingQuote(quote)}
                          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handlePrintQuote(quote)}
                          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadPdf(quote)}
                          disabled={isGenerating}
                          className="p-2 text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                          title="Baixar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
                              deleteQuote(quote.id);
                            }
                          }}
                          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {quotes.length === 0 && (
                <div className="col-span-full py-24 text-center bg-white/5 backdrop-blur-md border border-dashed border-white/20 rounded-2xl">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
                    <FileText className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="text-2xl font-light opacity-60">Nenhum orçamento encontrado</h3>
                  <p className="opacity-40 mt-2">Crie um novo orçamento para começar.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-7xl mx-auto relative z-10"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all active:scale-95 border border-white/10 backdrop-blur-md"
                >
                  <ArrowLeft className="w-8 h-8" />
                </button>
                <div>
                  <h1 className="text-6xl font-light tracking-tight text-white">Nova Proposta</h1>
                  <p className="text-xl opacity-60 mt-2 font-light">Configure os itens e o cliente</p>
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-2xl font-bold border border-white/20 backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Save className="w-6 h-6" /> 
                <span>FINALIZAR ORÇAMENTO</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left Column: Config */}
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-8">Informações Base</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Cliente Destinatário</label>
                      <select 
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white"
                      >
                        <option value="" className="bg-[#004a7c]">Selecione um cliente...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id} className="bg-[#004a7c]">{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Importação Rápida (CSV)</label>
                      <input 
                        type="file" 
                        accept=".csv" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden" 
                        id="csv-upload"
                      />
                      <label 
                        htmlFor="csv-upload"
                        className="w-full flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/10 rounded-2xl p-10 text-white/20 hover:border-white/30 hover:text-white/40 cursor-pointer transition-all group bg-white/5"
                      >
                        <FileSpreadsheet className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs font-bold uppercase tracking-widest">Carregar Planilha</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-8">Resumo Financeiro</h3>
                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Subtotal Bruto</span>
                      <span className="font-mono font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Descontos</span>
                      <span className="font-mono font-bold text-emerald-400">R$ 0,00</span>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-white/40">Total Geral</span>
                      <span className="text-5xl font-light text-white tracking-tighter">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Items */}
              <div className="lg:col-span-2">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-8 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <h2 className="text-3xl font-light text-white tracking-tight">Itens da Proposta</h2>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <select 
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const product = products.find(p => p.id === e.target.value);
                          if (product) {
                            setItems([...items, { id: uuidv4(), description: product.name, quantity: 1, unitPrice: product.price, total: product.price }]);
                          }
                          e.target.value = '';
                        }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest focus:border-white/30 outline-none transition-all text-white"
                      >
                        <option value="" className="bg-[#004a7c]">Catálogo...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} className="bg-[#004a7c]">{p.name} - R$ {p.price}</option>
                        ))}
                      </select>
                      <button 
                        onClick={addItem}
                        className="bg-white/10 text-white p-4 rounded-xl hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                        title="Adicionar Manual"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-white/40 text-[10px] uppercase tracking-wider font-bold">
                          <th className="p-6">Descrição</th>
                          <th className="p-6 w-24 text-center">Qtd</th>
                          <th className="p-6 w-32 text-right">Unitário</th>
                          <th className="p-6 w-32 text-right">Total</th>
                          <th className="p-6 w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {items.map((item) => (
                          <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <input 
                                type="text" 
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                className="w-full bg-transparent border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-white focus:bg-white/5 focus:border-white/20 outline-none transition-all"
                                placeholder="Nome do serviço ou produto"
                              />
                            </td>
                            <td className="p-4">
                              <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full bg-transparent border border-transparent rounded-xl px-4 py-3 text-sm font-mono font-bold text-center text-white/60 focus:bg-white/5 focus:border-white/20 outline-none transition-all"
                                min="1"
                              />
                            </td>
                            <td className="p-4">
                              <input 
                                type="number" 
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full bg-transparent border border-transparent rounded-xl px-4 py-3 text-sm font-mono font-bold text-right text-white/60 focus:bg-white/5 focus:border-white/20 outline-none transition-all"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="p-4 text-right">
                              <span className="text-sm font-bold text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="p-3 text-white/20 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/10"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {items.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-20 text-center">
                              <div className="flex flex-col items-center gap-4 opacity-20">
                                <Wrench className="w-12 h-12" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Adicione itens para compor o orçamento.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote View Modal */}
      <Modal 
        isOpen={!!viewingQuote} 
        onClose={() => setViewingQuote(null)} 
        title="Detalhes da Proposta"
        maxWidth="4xl"
        glass
      >
        {viewingQuote && (
          <div className="space-y-8 p-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Cliente</p>
                <h3 className="text-3xl font-light text-white">
                  {clients.find(c => c.id === viewingQuote.clientId)?.name}
                </h3>
                <p className="text-sm text-white/40 font-mono mt-1">
                  Emitido em {new Date(viewingQuote.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Valor Total</p>
                <p className="text-4xl font-light text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewingQuote.totalValue)}
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10">
                    <th className="p-4">Item / Descrição</th>
                    <th className="p-4 text-center">Qtd</th>
                    <th className="p-4 text-right">Unitário</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {viewingQuote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-4 text-sm font-bold text-white">{item.description}</td>
                      <td className="p-4 text-sm text-center text-white/60 font-mono">{item.quantity}</td>
                      <td className="p-4 text-sm text-right text-white/60 font-mono">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
                      </td>
                      <td className="p-4 text-sm text-right font-bold text-white font-mono">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => handleDownloadPdf(viewingQuote)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95"
              >
                <Printer className="w-5 h-5" /> Imprimir Proposta
              </button>
              <button 
                onClick={() => setViewingQuote(null)}
                className="px-8 py-4 text-white/60 hover:text-white transition-colors font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Hidden Ultra-Quality PDF Template */}
      {quoteToPrint && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <div 
            ref={printRef}
            className="bg-white w-[800px] text-zinc-900 font-sans relative"
            style={{ minHeight: '1131px', padding: '0' }}
          >
            {/* Left Vertical Brand Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600"></div>
            
            {/* Main Content Container: Continuous Flow Design */}
            <div className="p-20 flex flex-col bg-white w-full">
              
              {/* Header: Minimalist & Linear */}
              <div className="flex justify-between items-end pb-16 border-b-4 border-zinc-900 mb-20 break-inside-avoid">
                <div className="space-y-8">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo" className="h-16 w-auto max-w-[240px] object-contain" />
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center rounded-xl shadow-lg">
                        <Wrench className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-3xl font-black tracking-tighter leading-none">IA COMPANY</span>
                        <span className="text-3xl font-light tracking-widest text-red-600 leading-none">TEC</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      <span>{companyData?.name || 'IA COMPANY TEC'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      <span>CNPJ {companyData?.document || '---'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-zinc-900">PROPOSTA</h1>
                  <div className="flex items-center justify-end gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>REF: #{quoteToPrint.id.substring(0, 8).toUpperCase()}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-200"></span>
                    <span>{new Date(quoteToPrint.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Client Section: Clean Linear Block */}
              <div className="mb-20 break-inside-avoid">
                <div className="grid grid-cols-12 gap-12">
                  <div className="col-span-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-4">Cliente / Destinatário</p>
                    <h2 className="text-4xl font-black text-zinc-900 tracking-tighter mb-6">
                      {clients.find(c => c.id === quoteToPrint.clientId)?.name}
                    </h2>
                    <div className="flex flex-wrap gap-x-12 gap-y-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      <p>DOC: {clients.find(c => c.id === quoteToPrint.clientId)?.document || '---'}</p>
                      <p>TEL: {clients.find(c => c.id === quoteToPrint.clientId)?.phone}</p>
                      <p className="w-full">END: {clients.find(c => c.id === quoteToPrint.clientId)?.address}</p>
                    </div>
                  </div>
                  <div className="col-span-4 flex flex-col justify-end items-end text-right border-l-2 border-zinc-50 pl-12">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest mb-1">Validade</p>
                        <p className="text-sm font-black text-zinc-900">15 DIAS</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest mb-1">Pagamento</p>
                        <p className="text-sm font-black text-zinc-900">FATURADO</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table: Brutalist & Continuous */}
              <div className="mb-20">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 border-b-2 border-zinc-900">
                      <th className="py-4 text-left">Item / Descrição</th>
                      <th className="py-4 text-center w-20">Qtd</th>
                      <th className="py-4 text-right w-32">Unitário</th>
                      <th className="py-4 text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {quoteToPrint.items.map((item, idx) => (
                      <tr key={item.id} className="break-inside-avoid">
                        <td className="py-8 pr-8">
                          <div className="flex gap-6">
                            <span className="text-[11px] font-black text-zinc-200 mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                            <p className="text-base font-black text-zinc-900 leading-tight tracking-tight">{item.description}</p>
                          </div>
                        </td>
                        <td className="py-8 text-center">
                          <span className="text-base font-mono font-black text-zinc-400">{item.quantity}</span>
                        </td>
                        <td className="py-8 text-right">
                          <span className="text-base font-mono font-bold text-zinc-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
                          </span>
                        </td>
                        <td className="py-8 text-right">
                          <span className="text-lg font-black text-zinc-900 font-mono tracking-tighter">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals: High Impact Linear Block */}
              <div className="mt-auto break-inside-avoid">
                <div className="border-t-4 border-zinc-900 pt-12">
                  <div className="flex justify-between items-start mb-20">
                    <div className="max-w-md">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Notas e Condições</p>
                      <p className="text-[11px] text-zinc-500 font-bold leading-relaxed uppercase tracking-wider">
                        Este orçamento contempla apenas os itens listados acima. 
                        Qualquer serviço extra será cobrado separadamente mediante aprovação prévia.
                      </p>
                    </div>
                    <div className="text-right space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Subtotal</p>
                        <p className="text-2xl font-bold text-zinc-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quoteToPrint.totalValue)}
                        </p>
                      </div>
                      <div className="space-y-1 pt-4 border-t border-zinc-100">
                        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-red-600">Investimento Total</p>
                        <p className="text-6xl font-black tracking-tighter text-zinc-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quoteToPrint.totalValue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Signatures: Clean Linear Grid */}
                  <div className="grid grid-cols-2 gap-24 pt-20 border-t border-zinc-50">
                    <div className="space-y-4">
                      <div className="flex flex-col items-center">
                        <div className="h-16 flex items-end justify-center w-full relative">
                          {companySignature && (
                            <img src={companySignature} alt="Assinatura" className="max-h-full max-w-full object-contain mb-[-8px] relative z-10" />
                          )}
                        </div>
                        <div className="h-px bg-zinc-200 w-full"></div>
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900">Síndico</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Assinatura</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-full"></div>
                        <div className="h-px bg-zinc-200 w-full"></div>
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900">Cliente</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Assinatura e Data</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer: Minimalist Bar */}
                <div className="mt-24 pt-12 border-t border-zinc-50 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">
                  <span>IA COMPANY TEC Cloud System</span>
                  <span>Autenticidade Garantida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
