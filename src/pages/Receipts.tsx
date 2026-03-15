import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Download, Printer, FileText, FileCheck, Calendar, DollarSign, User, ArrowLeft } from 'lucide-react';
import { generatePdf } from '../utils/pdfGenerator';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Receipts() {
  const navigate = useNavigate();
  const { clients, companyLogo, companyData, companySignature, addReceipt } = useStore();
  const [clientId, setClientId] = useState('');
  const [value, setValue] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find(c => c.id === clientId);

  const handleSaveAndDownload = async () => {
    if (!clientId || value <= 0 || !description) {
      alert('Preencha todos os campos obrigatórios (Cliente, Valor e Descrição).');
      return;
    }

    if (!receiptRef.current) return;

    setIsGenerating(true);
    try {
      // Save to store
      addReceipt({
        clientId,
        value,
        description,
        date
      });

      // Generate PDF
      const fileName = `Recibo_${selectedClient?.name.replace(/\s+/g, '_')}_${date}.pdf`;
      
      await generatePdf(receiptRef.current, fileName);
      
      // Reset form
      setClientId('');
      setValue(0);
      setDescription('');
      
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      alert('Erro ao gerar PDF. Tente usar o botão "Imprimir" no topo da página como alternativa.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mb-6"
          />
          <p className="text-white font-black uppercase tracking-widest text-sm animate-pulse">Gerando Recibo...</p>
        </div>
      )}

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 print:hidden">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white border border-white/10 backdrop-blur-md shadow-xl active:scale-95"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div>
            <h1 className="text-6xl font-light tracking-tight">Recibos</h1>
            <p className="text-xl opacity-60 mt-2 font-light">Gere e salve recibos profissionais em PDF</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all"
          >
            <Printer className="w-5 h-5" /> 
            <span className="font-medium">Imprimir</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveAndDownload}
            disabled={isGenerating || !clientId || value <= 0 || !description}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" /> 
            <span className="text-lg font-medium">{isGenerating ? 'Gerando...' : 'Salvar e Baixar'}</span>
          </motion.button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 print:hidden"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/10 p-3 rounded-xl">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Dados do Recibo</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Cliente *
              </label>
              <select 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl px-4 py-3 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#004a7c]">Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#004a7c]">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">R$</span>
                <input 
                  type="number" 
                  value={value || ''}
                  onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl pl-12 pr-4 py-3 outline-none transition-all placeholder:text-white/20"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Data *
              </label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl px-4 py-3 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Referente a *
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl px-4 py-3 outline-none transition-all min-h-[150px] resize-none placeholder:text-white/20"
                placeholder="Ex: Serviços de manutenção preventiva e corretiva nos portões eletrônicos..."
              />
            </div>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/5 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white/10 overflow-x-auto print:p-0 print:bg-transparent print:border-none">
            
            {/* Actual Receipt to be printed/saved */}
            <div 
              ref={receiptRef}
              className="bg-white w-full max-w-[800px] mx-auto shadow-2xl p-12 text-gray-900 print:shadow-none rounded-sm"
              style={{ minHeight: '1056px' }} // A4 approximate ratio
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8 break-inside-avoid">
                <div className="flex items-center gap-4">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo" className="h-16 w-auto max-w-[200px] object-contain" />
                  ) : (
                    <div className="p-3 bg-red-600 rounded-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wider">Recibo</h2>
                    <p className="text-gray-500 font-medium">Nº {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  {companyData ? (
                    <>
                      <p className="font-bold text-gray-900">{companyData.name}</p>
                      <p>CNPJ/CPF: {companyData.document}</p>
                      <p>{companyData.phone}</p>
                      <p>{companyData.email}</p>
                    </>
                  ) : (
                    <p className="italic">Configure os dados da empresa<br/>nas Configurações</p>
                  )}
                </div>
              </div>

              {/* Value Box */}
              <div className="flex justify-end mb-8 break-inside-avoid">
                <div className="text-3xl font-bold text-gray-900 border-2 border-gray-900 p-4 rounded-lg inline-block bg-gray-50">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                </div>
              </div>

              {/* Body */}
              <div className="space-y-10 text-xl leading-relaxed break-inside-avoid">
                <p>
                  Recebi(emos) de <strong className="uppercase border-b border-gray-300 pb-1">{selectedClient?.name || '__________________________________________________'}</strong>, 
                  {selectedClient?.document ? ` inscrito(a) no CNPJ/CPF sob o nº ${selectedClient.document}, ` : ' '}
                  a importância de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}</strong>.
                </p>

                <p>
                  Referente a: <span className="italic border-b border-gray-200 pb-1 inline-block w-full">{description || '________________________________________________________________________________________________________________________________________________________________'}</span>
                </p>

                <p className="text-gray-700">
                  Para maior clareza, firmo(amos) o presente recibo para que produza os seus efeitos legais.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-32 pt-8 text-center break-inside-avoid">
                <p className="mb-20 text-lg">
                  _________________, {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <div className="grid grid-cols-2 gap-16 max-w-3xl mx-auto">
                  <div className="flex flex-col items-center w-full">
                    <div className="h-20 flex items-end justify-center w-full relative">
                      {companySignature && (
                        <img src={companySignature} alt="Assinatura" className="max-h-full max-w-full object-contain mb-[-10px] relative z-10" />
                      )}
                    </div>
                    <div className="border-t-2 border-gray-800 pt-3 w-full">
                      <p className="font-bold text-lg">Síndico</p>
                      <p className="text-sm text-gray-500 mt-1">Assinatura</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-full">
                    <div className="h-20 w-full"></div>
                    <div className="border-t-2 border-gray-800 pt-3 w-full">
                      <p className="font-bold text-lg">Cliente</p>
                      <p className="text-sm text-gray-500 mt-1">Assinatura</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
