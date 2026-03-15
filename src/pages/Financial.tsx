import React, { useState, useMemo, useRef } from 'react';
import { useStore, Cost } from '../store';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Wallet, 
  FileSpreadsheet, BarChart3, Lightbulb, ArrowUpRight, ArrowDownRight, 
  X, ArrowLeft, Calendar, Tag, User, ShieldCheck, FolderOpen, 
  FileText, UserCheck 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '../components/Modal';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Financial() {
  const navigate = useNavigate();
  const { receipts, costs, addCost, deleteCost, addReceipt, clients } = useStore();
  
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [description, setDescription] = useState('');
  const [value, setValue] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Material');
  const [clientId, setClientId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalIncome = receipts.reduce((sum, r) => sum + r.value, 0);
  const totalCosts = costs.reduce((sum, c) => sum + c.value, 0);
  const balance = totalIncome - totalCosts;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let importedCosts = 0;
        let importedIncomes = 0;

        results.data.forEach((row: any) => {
          const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('data') || k.toLowerCase().includes('date'));
          const descKey = Object.keys(row).find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('histórico') || k.toLowerCase().includes('historico'));
          const valKey = Object.keys(row).find(k => k.toLowerCase().includes('valor') || k.toLowerCase().includes('value') || k.toLowerCase().includes('quantia'));
          
          if (!valKey) return;

          const description = descKey ? row[descKey] : 'Importado via CSV';
          let date = new Date().toISOString().split('T')[0];
          
          if (dateKey && row[dateKey]) {
            const dStr = row[dateKey];
            if (dStr.includes('/')) {
              const parts = dStr.split('/');
              if (parts.length === 3) {
                date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            } else {
              date = dStr;
            }
          }

          const valStr = String(row[valKey]).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
          const value = parseFloat(valStr);

          if (isNaN(value) || value === 0) return;

          if (value < 0) {
            addCost({
              description,
              value: Math.abs(value),
              date,
              category: 'Importado'
            });
            importedCosts++;
          } else {
            const genericClientId = clients.length > 0 ? clients[0].id : '';
            if (genericClientId) {
              addReceipt({
                clientId: genericClientId,
                description,
                value,
                date
              });
              importedIncomes++;
            }
          }
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || value <= 0) {
      alert('Preencha descrição e valor válido.');
      return;
    }

    addCost({
      description,
      value,
      date,
      category
    });

    setDescription('');
    setValue(0);
    setIsAddingCost(false);
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || value <= 0 || !clientId) {
      alert('Preencha cliente, descrição e valor válido.');
      return;
    }

    addReceipt({
      clientId,
      description,
      value,
      date
    });

    setDescription('');
    setValue(0);
    setClientId('');
    setIsAddingIncome(false);
  };

  const transactions = [
    ...receipts.map(r => ({ ...r, type: 'income' as const })),
    ...costs.map(c => ({ ...c, type: 'expense' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const monthlyData = useMemo(() => {
    const dataByMonth: Record<string, { name: string, receitas: number, despesas: number, saldo: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      if (!dataByMonth[monthYear]) {
        dataByMonth[monthYear] = { name: monthName, receitas: 0, despesas: 0, saldo: 0 };
      }
      
      if (t.type === 'income') {
        dataByMonth[monthYear].receitas += t.value;
      } else {
        dataByMonth[monthYear].despesas += t.value;
      }
      dataByMonth[monthYear].saldo = dataByMonth[monthYear].receitas - dataByMonth[monthYear].despesas;
    });

    return Object.keys(dataByMonth)
      .sort()
      .map(key => dataByMonth[key]);
  }, [transactions]);

  const expensesByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    costs.forEach(c => {
      data[c.category] = (data[c.category] || 0) + c.value;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [costs]);

  const insights = useMemo(() => {
    if (monthlyData.length === 0) return null;

    const bestMonth = [...monthlyData].sort((a, b) => b.saldo - a.saldo)[0];
    const worstMonth = [...monthlyData].sort((a, b) => b.despesas - a.despesas)[0];
    const topCategory = expensesByCategory.length > 0 ? expensesByCategory[0] : null;

    let growth = 0;
    if (monthlyData.length >= 2) {
      const currentMonth = monthlyData[monthlyData.length - 1];
      const previousMonth = monthlyData[monthlyData.length - 2];
      if (previousMonth.receitas > 0) {
        growth = ((currentMonth.receitas - previousMonth.receitas) / previousMonth.receitas) * 100;
      }
    }

    return {
      bestMonth,
      worstMonth,
      topCategory,
      growth
    };
  }, [monthlyData, expensesByCategory]);

  return (
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="currentColor" className="text-white/5" fillOpacity="0.5" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="currentColor" className="text-white/10" fillOpacity="0.5" />
        </svg>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white border border-white/10 shadow-xl backdrop-blur-md active:scale-95"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div>
            <h1 className="text-6xl font-light tracking-tight text-white">Financeiro</h1>
            <p className="text-xl text-white/60 mt-2 font-light">Controle total do seu fluxo de caixa</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden" 
            id="csv-upload-financial"
          />
          <motion.label 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            htmlFor="csv-upload-financial"
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all cursor-pointer rounded-xl"
          >
            <FileSpreadsheet className="w-5 h-5" /> 
            <span className="font-medium">Importar</span>
          </motion.label>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setDescription('');
              setValue(0);
              setClientId('');
              setIsAddingIncome(true);
            }}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-6 py-4 flex items-center gap-3 border border-emerald-500/30 transition-all rounded-xl backdrop-blur-md"
          >
            <Plus className="w-6 h-6" /> 
            <span className="text-lg font-medium">Receita</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setDescription('');
              setValue(0);
              setIsAddingCost(true);
            }}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-4 flex items-center gap-3 border border-red-500/30 transition-all rounded-xl backdrop-blur-md"
          >
            <Plus className="w-6 h-6" /> 
            <span className="text-lg font-medium">Custo</span>
          </motion.button>
        </div>
      </header>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white/60 font-bold uppercase tracking-widest text-sm">Receitas</h3>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-5xl font-black text-white tracking-tight">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white/60 font-bold uppercase tracking-widest text-sm">Despesas</h3>
            <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <p className="text-5xl font-black text-white tracking-tight">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCosts)}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white/60 font-bold uppercase tracking-widest text-sm">Saldo</h3>
            <div className={`p-3 rounded-2xl ${balance >= 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className={`text-5xl font-black tracking-tight ${balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
          </p>
        </motion.div>
      </div>

      {/* Digital Accountability Folder Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 relative z-10"
      >
        <Link to="/accountability?tab=folder" className="block group">
          <div className="bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-[40px] p-8 md:p-12 border border-white/10 backdrop-blur-md hover:from-indigo-600/30 hover:to-blue-600/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-48 h-48 text-white" />
            </div>
            
            <div className="max-w-3xl relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Pasta de Prestação de Contas Digital</h2>
              </div>
              
              <p className="text-xl text-white/70 leading-relaxed mb-8">
                Todos os balancetes e notas fiscais são digitalizados e ficam disponíveis para o conselho fiscal validar com assinatura digital, garantindo total transparência e segurança jurídica.
              </p>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-sm">Balancetes Digitais</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">Notas Fiscais</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm">Validação do Conselho</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Insights Section */}
      {insights && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 rounded-2xl p-6 border border-white/20 flex items-center gap-5 shadow-sm backdrop-blur-md"
          >
            <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
              <Lightbulb className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-1">Melhor Mês</p>
              <p className="text-lg font-bold text-white">{insights.bestMonth.name}</p>
              <p className="text-lg font-black text-indigo-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.bestMonth.saldo)}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 rounded-2xl p-6 border border-white/20 flex items-center gap-5 shadow-sm backdrop-blur-md"
          >
            <div className="p-4 bg-red-500/20 text-red-400 rounded-xl shrink-0">
              <TrendingDown className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">Pior Mês</p>
              <p className="text-lg font-bold text-zinc-900">{insights.worstMonth.name}</p>
              <p className="text-lg font-black text-rose-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.worstMonth.despesas)}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 rounded-2xl p-6 border border-white/20 flex items-center gap-5 shadow-sm backdrop-blur-md"
          >
            <div className="p-4 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-1">Maior Categoria</p>
              <p className="text-lg font-bold text-white">{insights.topCategory?.name || 'N/A'}</p>
              <p className="text-lg font-black text-amber-400">
                {insights.topCategory ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insights.topCategory.value) : '-'}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 rounded-2xl p-6 border border-white/20 flex items-center gap-5 shadow-sm backdrop-blur-md"
          >
            <div className="p-4 bg-teal-500/20 text-teal-400 rounded-xl shrink-0">
              {insights.growth > 0 ? (
                <ArrowUpRight className="w-7 h-7" />
              ) : insights.growth < 0 ? (
                <ArrowDownRight className="w-7 h-7" />
              ) : <TrendingUp className="w-7 h-7" />}
            </div>
            <div>
              <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-1">Crescimento</p>
              <p className="text-2xl font-black text-white">
                {Math.abs(insights.growth).toFixed(1)}%
              </p>
              <p className="text-xs text-white/60">vs mês anterior</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Charts Section */}
      {monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl backdrop-blur-md"
          >
            <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Evolução Mensal</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                    contentStyle={{ backgroundColor: '#004a7c', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '1rem', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Bar dataKey="receitas" name="Receitas" fill="#34d399" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#f87171" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl backdrop-blur-md"
          >
            <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Acompanhamento de Saldo</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                    contentStyle={{ backgroundColor: '#004a7c', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '1rem', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Line type="monotone" dataKey="saldo" name="Saldo Mensal" stroke="#60a5fa" strokeWidth={4} dot={{ r: 6, fill: '#60a5fa', strokeWidth: 2, stroke: '#004a7c' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Transactions List */}
      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Histórico de Transações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transactions.map((t, index) => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className="bg-white/10 rounded-3xl p-8 border border-white/20 flex flex-col relative group hover:bg-white/20 transition-all shadow-xl backdrop-blur-md"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/10 p-3 rounded-xl">
                  {t.type === 'income' ? <ArrowUpRight className="w-6 h-6 text-emerald-400" /> : <ArrowDownRight className="w-6 h-6 text-red-400" />}
                </div>
                {t.type === 'expense' && (
                  <button 
                    onClick={() => deleteCost(t.id)}
                    className="p-3 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{t.description}</h3>
              
              <p className={`text-3xl font-black mb-6 ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.value)}
              </p>
              
              <div className="mt-auto flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {t.type === 'income' ? 'Receita' : (t as Cost).category}
                </span>
              </div>
            </motion.div>
          ))}
          
          {transactions.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-md">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
                <DollarSign className="w-10 h-10 text-white/40" />
              </div>
              <h3 className="text-2xl font-light text-white/60">Nenhuma transação registrada</h3>
              <p className="text-white/40 mt-2">Comece adicionando uma receita ou custo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Cost Modal */}
      <Modal 
        isOpen={isAddingCost} 
        onClose={() => setIsAddingCost(false)} 
        title="Adicionar Custo"
        maxWidth="sm"
        glass={true}
      >
        <form onSubmit={handleAddCost} className="space-y-6 p-2">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/60 mb-2">Descrição *</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white placeholder:text-white/30"
              placeholder="Ex: Compra de materiais..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/60 mb-2">Valor (R$) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">R$</span>
              <input 
                type="number" 
                value={value || ''}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl pl-12 pr-4 py-3 outline-none transition-all text-white"
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/60 mb-2">Data *</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white [color-scheme:dark]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/60 mb-2">Categoria</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white appearance-none cursor-pointer"
            >
              <option value="Material" className="bg-[#004a7c]">Material</option>
              <option value="Combustível" className="bg-[#004a7c]">Combustível</option>
              <option value="Alimentação" className="bg-[#004a7c]">Alimentação</option>
              <option value="Ferramentas" className="bg-[#004a7c]">Ferramentas</option>
              <option value="Outros" className="bg-[#004a7c]">Outros</option>
            </select>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsAddingCost(false)}
              className="px-6 py-3 text-white/60 hover:text-white transition-colors font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-10 py-3 rounded-xl font-bold border border-red-500/30 transition-all active:scale-95 shadow-lg backdrop-blur-md"
            >
              SALVAR CUSTO
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Income Modal */}
      <Modal 
        isOpen={isAddingIncome} 
        onClose={() => setIsAddingIncome(false)} 
        title="Adicionar Receita"
        maxWidth="sm"
        glass={true}
      >
        <form onSubmit={handleAddIncome} className="space-y-6 p-2">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/60 mb-2">Cliente *</label>
            <select 
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white appearance-none cursor-pointer"
              required
            >
              <option value="" className="bg-[#004a7c]">Selecione um cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-[#004a7c]">{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/60 mb-2">Descrição *</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white placeholder:text-white/30"
              placeholder="Ex: Pagamento de serviço avulso..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/60 mb-2">Valor (R$) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">R$</span>
              <input 
                type="number" 
                value={value || ''}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl pl-12 pr-4 py-3 outline-none transition-all text-white"
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-white/60 mb-2">Data *</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 outline-none transition-all text-white [color-scheme:dark]"
              required
            />
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsAddingIncome(false)}
              className="px-6 py-3 text-white/60 hover:text-white transition-colors font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-10 py-3 rounded-xl font-bold border border-emerald-500/30 transition-all active:scale-95 shadow-lg backdrop-blur-md"
            >
              SALVAR RECEITA
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
