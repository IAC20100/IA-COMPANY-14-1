import React from 'react';
import { useStore } from '../store';
import { 
  Zap, 
  Sun, 
  Eye, 
  TrendingDown, 
  DollarSign, 
  ArrowDownRight, 
  Leaf,
  Info,
  Lightbulb,
  Battery
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { motion } from 'motion/react';

export default function EnergyMonitoring() {
  const { energyData } = useStore();

  const totalSolar = energyData.reduce((acc, curr) => acc + curr.solarGeneration, 0);
  const totalSensorSavings = energyData.reduce((acc, curr) => acc + curr.sensorSavings, 0);
  const totalMoneySaved = energyData.reduce((acc, curr) => acc + (curr.costWithoutTech - curr.actualCost), 0);
  
  const latestMonth = energyData[energyData.length - 1];
  const monthlySavingsPercent = Math.round(((latestMonth.costWithoutTech - latestMonth.actualCost) / latestMonth.costWithoutTech) * 100);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">Eco-Monitoramento</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mt-2 font-medium">Eficiência energética e sustentabilidade em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-6 py-3 rounded-2xl font-bold border border-emerald-100 dark:border-emerald-800 shadow-sm">
          <Leaf className="w-5 h-5" />
          Selo Verde Ativo
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm"
        >
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl w-fit mb-6">
            <Sun className="w-6 h-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Geração Solar (Total)</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalSolar.toLocaleString()} <span className="text-sm font-bold text-slate-400">kWh</span></h3>
          <div className="mt-4 flex items-center gap-1 text-emerald-600 font-bold text-sm">
            <TrendingDown className="w-4 h-4 rotate-180" />
            <span>+12% vs mês ant.</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm"
        >
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl w-fit mb-6">
            <Eye className="w-6 h-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Economia Sensores</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalSensorSavings.toLocaleString()} <span className="text-sm font-bold text-slate-400">kWh</span></h3>
          <div className="mt-4 flex items-center gap-1 text-emerald-600 font-bold text-sm">
            <TrendingDown className="w-4 h-4" />
            <span>-8% desperdício</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-200 dark:shadow-none"
        >
          <div className="p-3 bg-white/20 text-white rounded-2xl w-fit mb-6">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-white/70 mb-1">Economia Financeira</p>
          <h3 className="text-3xl font-black text-white">R$ {totalMoneySaved.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-1 text-white/80 font-bold text-sm">
            <ArrowDownRight className="w-4 h-4" />
            <span>{monthlySavingsPercent}% de redução na conta</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm"
        >
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl w-fit mb-6">
            <Leaf className="w-6 h-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">CO2 Evitado</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{(totalSolar * 0.5).toFixed(1)} <span className="text-sm font-bold text-slate-400">kg</span></h3>
          <div className="mt-4 flex items-center gap-1 text-emerald-600 font-bold text-sm">
            <span>Equiv. 42 árvores</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Cost Comparison Chart */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Comparativo de Custos</h3>
              <p className="text-sm text-slate-500 font-medium">Custo Estimado vs Custo Real (R$)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-zinc-700" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sem Tecnologia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Com Tecnologia</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="costWithoutTech" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Sem Tecnologia" />
                <Bar dataKey="actualCost" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Com Tecnologia" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Generation vs Savings Chart */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Geração vs Economia</h3>
              <p className="text-sm text-slate-500 font-medium">Impacto em kWh por categoria</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSensor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="solarGeneration" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSolar)" name="Geração Solar" strokeWidth={3} />
                <Area type="monotone" dataKey="sensorSavings" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSensor)" name="Economia Sensores" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">Dica de Eficiência</h4>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            A limpeza dos painéis solares está agendada para o próximo mês. Isso pode aumentar a eficiência em até 15%.
          </p>
          <button className="mt-auto text-indigo-600 font-bold text-sm hover:underline flex items-center gap-2">
            Ver Cronograma <Info className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <Battery className="w-5 h-5" />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">Status do Sistema</h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Sensores de Presença</span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md uppercase">100% OK</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Inversores Solares</span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md uppercase">Operacional</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Baterias de Backup</span>
              <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md uppercase">85% Carga</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-zinc-800 p-8 rounded-[40px] text-white flex flex-col gap-6">
          <h4 className="font-black uppercase tracking-wider text-sm text-slate-400">Próximo Passo</h4>
          <p className="text-slate-300 font-medium leading-relaxed">
            A implementação de sensores de presença no Subsolo 2 está prevista para reduzir o consumo em mais 300kWh/mês.
          </p>
          <button className="mt-auto bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95">
            Aprovar Expansão
          </button>
        </div>
      </div>
    </div>
  );
}
