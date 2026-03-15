import { useMemo, useState, useRef, useEffect } from 'react';
import { useStore, Payment, LegalAgreement, Client } from '../store';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Gavel, 
  FileText, 
  Download, 
  Filter,
  ArrowLeft,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Loader2,
  FolderOpen,
  ShieldCheck,
  Eye,
  CheckCircle,
  Upload,
  UserCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export default function AccountabilityDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    clients, 
    payments, 
    legalAgreements, 
    receipts, 
    costs, 
    companyData,
    digitalFolder,
    validateDigitalFolderItem,
    addDigitalFolderItem
  } = useStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'financial' | 'folder'>(
    (searchParams.get('tab') as 'financial' | 'folder') || 'financial'
  );

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'folder' || tab === 'financial') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'financial' | 'folder') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [timeRange, setTimeRange] = useState('6m');

  // Mock folder data if empty
  const displayFolder = useMemo(() => {
    if (digitalFolder.length > 0) return digitalFolder;
    
    return [
      {
        id: 'f1',
        type: 'BALANCE_SHEET',
        title: 'Balancete Mensal - Janeiro 2026',
        date: '2026-02-05',
        amount: 45200.50,
        fileUrl: '#',
        status: 'PENDING',
        signatures: [
          { id: 's1', userName: 'Carlos Silva', role: 'Presidente do Conselho', date: '2026-02-06' }
        ]
      },
      {
        id: 'f2',
        type: 'INVOICE',
        title: 'Nota Fiscal - Manutenção Elevadores',
        date: '2026-02-10',
        amount: 1250.00,
        fileUrl: '#',
        status: 'VALIDATED',
        signatures: [
          { id: 's2', userName: 'Carlos Silva', role: 'Presidente do Conselho', date: '2026-02-11' },
          { id: 's3', userName: 'Maria Oliveira', role: 'Conselheira', date: '2026-02-11' },
          { id: 's4', userName: 'João Pereira', role: 'Conselheiro', date: '2026-02-12' }
        ]
      },
      {
        id: 'f3',
        type: 'TAX_DOC',
        title: 'Guia FGTS - Janeiro 2026',
        date: '2026-02-07',
        amount: 3400.20,
        fileUrl: '#',
        status: 'PENDING',
        signatures: []
      }
    ];
  }, [digitalFolder]);

  // ... (displayPayments and displayAgreements useMemo remain the same)
  const displayPayments = useMemo(() => {
    if (payments.length > 0) return payments;
    const mock: Payment[] = [];
    clients.forEach(client => {
      for (let i = 0; i < 6; i++) {
        const date = subMonths(new Date(), i);
        const status: any = Math.random() > 0.2 ? 'PAID' : (Math.random() > 0.5 ? 'OVERDUE' : 'PENDING');
        mock.push({
          id: `mock-p-${client.id}-${i}`,
          clientId: client.id,
          amount: 350 + Math.random() * 100,
          dueDate: format(date, 'yyyy-MM-dd'),
          status,
          reference: format(date, 'MM/yyyy'),
          paymentDate: status === 'PAID' ? format(date, 'yyyy-MM-dd') : undefined
        });
      }
    });
    return mock;
  }, [payments, clients]);

  const displayAgreements = useMemo(() => {
    if (legalAgreements.length > 0) return legalAgreements;
    return clients.slice(0, 3).map((c, i) => ({
      id: `mock-a-${i}`,
      clientId: c.id,
      totalAmount: 2500 + i * 500,
      installments: 12,
      remainingInstallments: 12 - (i * 2),
      status: i === 2 ? 'BREACHED' : 'ACTIVE',
      startDate: format(subMonths(new Date(), i + 1), 'yyyy-MM-dd'),
      notes: 'Acordo referente a débitos de 2025'
    }));
  }, [legalAgreements, clients]);

  const totalDelinquency = useMemo(() => {
    return displayPayments
      .filter(p => p.status === 'OVERDUE')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [displayPayments]);

  const recoveryRate = useMemo(() => {
    const paid = displayPayments.filter(p => p.status === 'PAID').length;
    return (paid / displayPayments.length) * 100;
  }, [displayPayments]);

  const activeAgreementsValue = useMemo(() => {
    return displayAgreements
      .filter(a => a.status === 'ACTIVE')
      .reduce((acc, curr) => acc + (curr.totalAmount * (curr.remainingInstallments / curr.installments)), 0);
  }, [displayAgreements]);

  const cashFlowData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStr = format(date, 'MMM/yy', { locale: ptBR });
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const revenue = receipts
        .filter(r => isWithinInterval(new Date(r.date), { start, end }))
        .reduce((acc, curr) => acc + curr.value, 0) + 
        displayPayments
        .filter(p => p.status === 'PAID' && p.paymentDate && isWithinInterval(new Date(p.paymentDate), { start, end }))
        .reduce((acc, curr) => acc + curr.amount, 0);

      const expenses = costs
        .filter(c => isWithinInterval(new Date(c.date), { start, end }))
        .reduce((acc, curr) => acc + curr.value, 0);

      data.push({ name: monthStr, Receita: revenue, Despesa: expenses });
    }
    return data;
  }, [receipts, costs, displayPayments]);

  const delinquencyTrendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStr = format(date, 'MMM/yy', { locale: ptBR });
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const amount = displayPayments
        .filter(p => p.status === 'OVERDUE' && isWithinInterval(new Date(p.dueDate), { start, end }))
        .reduce((acc, curr) => acc + curr.amount, 0);

      data.push({ name: monthStr, Inadimplência: amount });
    }
    return data;
  }, [displayPayments]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(reportRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Calculate height to maintain aspect ratio
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = resolve));
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_Financeiro_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 -m-8 p-8 md:p-12 overflow-x-hidden">
      {/* Hidden Report Template for PDF Generation */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={reportRef} className="w-[800px] bg-white p-12 text-slate-900 font-sans">
          <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Relatório de Prestação de Contas</h1>
              <p className="text-indigo-600 font-bold text-lg">Gestão Condominial Inteligente</p>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900">{companyData?.name || 'IA COMPANY TEC'}</p>
              <p className="text-sm text-slate-500">{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Receita Acumulada</p>
              <p className="text-2xl font-black text-emerald-600">R$ {(receipts.reduce((a, b) => a + b.value, 0) + displayPayments.filter(p => p.status === 'PAID').reduce((a, b) => a + b.amount, 0)).toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Inadimplência Total</p>
              <p className="text-2xl font-black text-rose-600">R$ {totalDelinquency.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Taxa Adimplência</p>
              <p className="text-2xl font-black text-indigo-600">{recoveryRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-black mb-6 border-l-4 border-indigo-600 pl-4 uppercase tracking-tight">Resumo de Acordos Jurídicos</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-4 text-xs font-black uppercase tracking-widest">Cliente/Unidade</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest">Valor Total</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest">Parcelas</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayAgreements.map(a => (
                  <tr key={a.id}>
                    <td className="p-4 font-bold">{clients.find(c => c.id === a.clientId)?.name}</td>
                    <td className="p-4">R$ {a.totalAmount.toLocaleString('pt-BR')}</td>
                    <td className="p-4">{a.installments - a.remainingInstallments}/{a.installments}</td>
                    <td className="p-4 font-bold">{a.status === 'ACTIVE' ? 'EM DIA' : 'ATRASADO'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-black mb-6 border-l-4 border-indigo-600 pl-4 uppercase tracking-tight">Maiores Inadimplentes</h2>
            <div className="space-y-4">
              {clients.slice(0, 5).map((c, i) => (
                <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-700">{i + 1}. {c.name}</span>
                  <span className="font-black text-rose-600">R$ {(1200 + i * 450).toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-slate-200 text-center">
            <div className="flex justify-around">
              <div className="w-64 border-t border-slate-400 pt-2">
                <p className="text-xs font-bold uppercase">Assinatura do Síndico</p>
              </div>
              <div className="w-64 border-t border-slate-400 pt-2">
                <p className="text-xs font-bold uppercase">Conselho Consultivo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-4 bg-white hover:bg-slate-50 rounded-2xl transition-all text-slate-600 border border-slate-200 shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900">Prestação de Contas</h1>
            <p className="text-xl text-slate-500 mt-2 font-medium">Combate à inadimplência e transparência financeira</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 flex mr-4">
            <button 
              onClick={() => handleTabChange('financial')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'financial' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Financeiro
            </button>
            <button 
              onClick={() => handleTabChange('folder')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'folder' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Pasta Digital
            </button>
          </div>
          <button 
            onClick={handleExportPDF}
            disabled={isGenerating}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} 
            Exportar PDF
          </button>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            <Upload className="w-5 h-5" /> {activeTab === 'financial' ? 'Novo Relatório' : 'Upload Documento'}
          </button>
        </div>
      </header>

      {activeTab === 'financial' ? (
        <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+12% vs mês ant.</span>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Receita Total</p>
            <h3 className="text-3xl font-black text-slate-900">R$ {(receipts.reduce((a, b) => a + b.value, 0) + displayPayments.filter(p => p.status === 'PAID').reduce((a, b) => a + b.amount, 0)).toLocaleString('pt-BR')}</h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-rose-100 p-3 rounded-2xl">
                <TrendingDown className="w-6 h-6 text-rose-600" />
              </div>
              <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full">-5% vs mês ant.</span>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Inadimplência</p>
            <h3 className="text-3xl font-black text-slate-900">R$ {totalDelinquency.toLocaleString('pt-BR')}</h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Meta: 95%</span>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Taxa de Adimplência</p>
            <h3 className="text-3xl font-black text-slate-900">{recoveryRate.toFixed(1)}%</h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 p-3 rounded-2xl">
                <Gavel className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{displayAgreements.filter(a => a.status === 'ACTIVE').length} Ativos</span>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Acordos Jurídicos</p>
            <h3 className="text-3xl font-black text-slate-900">R$ {activeAgreementsValue.toLocaleString('pt-BR')}</h3>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-indigo-600" /> Fluxo de Caixa
              </h3>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button className="px-4 py-1 text-xs font-bold bg-white shadow-sm rounded-lg">6 Meses</button>
                <button className="px-4 py-1 text-xs font-bold text-slate-400">1 Ano</button>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Receita" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Despesa" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-rose-600" /> Evolução da Inadimplência
              </h3>
              <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={delinquencyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="Inadimplência" stroke="#f43f5e" strokeWidth={4} dot={{ r: 6, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Legal Agreements & Delinquents Table */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <Gavel className="w-6 h-6 text-amber-600" /> Acordos Jurídicos em Andamento
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Buscar acordo..." className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-300 transition-all" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Unidade/Cliente</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Valor Total</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Parcelas</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayAgreements.map(agreement => {
                    const client = clients.find(c => c.id === agreement.clientId);
                    return (
                      <tr key={agreement.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                              {client?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{client?.name}</p>
                              <p className="text-xs text-slate-500">{client?.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-slate-900">R$ {agreement.totalAmount.toLocaleString('pt-BR')}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500" 
                                style={{ width: `${((agreement.installments - agreement.remainingInstallments) / agreement.installments) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-500">{agreement.installments - agreement.remainingInstallments}/{agreement.installments}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            agreement.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            agreement.status === 'BREACHED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                            'bg-slate-50 text-slate-600 border-slate-100'
                          }`}>
                            {agreement.status === 'ACTIVE' ? 'Em Dia' : agreement.status === 'BREACHED' ? 'Quebrado' : 'Finalizado'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm">Detalhes</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600" /> Maiores Inadimplentes
            </h3>
            <div className="space-y-6">
              {clients.slice(0, 5).map((client, i) => {
                const amount = 1200 + (i * 450);
                return (
                  <div key={client.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-rose-600">
                        {i + 1}º
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{client.name}</p>
                        <p className="text-xs text-slate-500">{client.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-rose-600">R$ {amount.toLocaleString('pt-BR')}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{i + 2} meses</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
              Ver Relatório Completo
            </button>
          </div>
        </div>
      </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <FolderOpen className="w-6 h-6 text-indigo-600" /> Documentos da Pasta Digital
                  </h3>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Buscar documento..." className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-300 transition-all" />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Documento</th>
                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Data</th>
                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Valor</th>
                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Validação</th>
                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {displayFolder.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                item.type === 'BALANCE_SHEET' ? 'bg-blue-50 text-blue-600' : 
                                item.type === 'INVOICE' ? 'bg-emerald-50 text-emerald-600' : 
                                'bg-amber-50 text-amber-600'
                              }`}>
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{item.title}</p>
                                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">
                                  {item.type === 'BALANCE_SHEET' ? 'Balancete' : item.type === 'INVOICE' ? 'Nota Fiscal' : 'Imposto'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-600">{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                          <td className="px-8 py-6 font-bold text-slate-900">
                            {item.amount ? `R$ ${item.amount.toLocaleString('pt-BR')}` : '-'}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {item.signatures.map((s, idx) => (
                                  <div key={idx} className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-black" title={`${s.userName} (${s.role})`}>
                                    {s.userName.charAt(0)}
                                  </div>
                                ))}
                                {[...Array(Math.max(0, 3 - item.signatures.length))].map((_, idx) => (
                                  <div key={idx} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-300 font-black">
                                    ?
                                  </div>
                                ))}
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                item.status === 'VALIDATED' ? 'text-emerald-600' : 'text-amber-600'
                              }`}>
                                {item.signatures.length}/3 Assinaturas
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-indigo-600">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => validateDigitalFolderItem(item.id, 'Carlos Silva', 'Presidente do Conselho')}
                                disabled={item.signatures.some(s => s.userName === 'Carlos Silva')}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                              >
                                <UserCheck className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" /> Conselho Fiscal
                </h3>
                <p className="text-sm text-slate-500 mb-8">Aprovação digital necessária para fechamento do mês. Mínimo de 3 assinaturas por documento.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black">C</div>
                    <div>
                      <p className="font-bold text-slate-900">Carlos Silva</p>
                      <p className="text-xs text-slate-500">Presidente do Conselho</p>
                    </div>
                    <div className="ml-auto text-emerald-600">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black">M</div>
                    <div>
                      <p className="font-bold text-slate-900">Maria Oliveira</p>
                      <p className="text-xs text-slate-500">Conselheira</p>
                    </div>
                    <div className="ml-auto text-amber-600">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-black">J</div>
                    <div>
                      <p className="font-bold text-slate-900">João Pereira</p>
                      <p className="text-xs text-slate-500">Conselheiro</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  Solicitar Assinaturas
                </button>
              </div>

              <div className="bg-slate-900 p-8 rounded-[40px] text-white">
                <h3 className="text-xl font-black mb-4">Assinatura Digital</h3>
                <p className="text-sm text-white/60 mb-6">Todos os documentos são criptografados e possuem validade jurídica conforme MP 2.200-2/2001.</p>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Hash de Segurança</p>
                  <p className="text-xs font-mono break-all text-indigo-300">8f9e2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a</p>
                </div>
                <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                  Configurar Certificado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
