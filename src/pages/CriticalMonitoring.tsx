import React, { useState } from 'react';
import { useStore, CriticalEvent } from '../store';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Bell,
  Settings,
  Droplets,
  DoorOpen,
  Zap,
  Flame,
  History,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CriticalMonitoring() {
  const { criticalEvents, updateCriticalEvent } = useStore();
  const [selectedEvent, setSelectedEvent] = useState<CriticalEvent | null>(null);

  const getStatusColor = (status: CriticalEvent['status']) => {
    switch (status) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'ALERT': return 'bg-amber-500 text-white';
      default: return 'bg-emerald-500 text-white';
    }
  };

  const getTypeIcon = (type: CriticalEvent['type']) => {
    switch (type) {
      case 'PUMP': return <Droplets className="w-6 h-6" />;
      case 'DOOR': return <DoorOpen className="w-6 h-6" />;
      case 'FIRE': return <Flame className="w-6 h-6" />;
      case 'ELECTRICAL': return <Zap className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  const handleSimulateAlert = (id: string) => {
    updateCriticalEvent(id, 'CRITICAL', 'Falha crítica detectada: Sensor reportando interrupção total.');
  };

  const handleResolve = (id: string) => {
    updateCriticalEvent(id, 'NORMAL', 'Evento resolvido pela equipe técnica.');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">Monitoramento Crítico</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mt-2 font-medium">Sensores IoT em tempo real e alertas de infraestrutura.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-100 dark:border-emerald-800">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Sistema Online
          </div>
          <button className="p-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Real-time Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {criticalEvents.map((event) => (
          <motion.div
            key={event.id}
            layout
            className={`bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm relative overflow-hidden transition-all ${
              event.status === 'CRITICAL' ? 'ring-2 ring-red-500 shadow-lg shadow-red-100 dark:shadow-none' : ''
            }`}
          >
            {event.status === 'CRITICAL' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
            )}
            
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-2xl ${
                event.status === 'CRITICAL' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 
                event.status === 'ALERT' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 
                'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
              }`}>
                {getTypeIcon(event.type)}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                event.status === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                event.status === 'ALERT' ? 'bg-amber-100 text-amber-700' : 
                'bg-emerald-100 text-emerald-700'
              }`}>
                {event.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{event.device}</h3>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-4">
              <MapPin className="w-3 h-3" />
              {event.location}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium line-clamp-2">
              {event.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                {format(new Date(event.lastUpdate), "HH:mm:ss")}
              </div>
              <div className="flex gap-2">
                {event.status !== 'NORMAL' ? (
                  <button 
                    onClick={() => handleResolve(event.id)}
                    className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                    title="Resolver"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSimulateAlert(event.id)}
                    className="p-2 bg-slate-50 dark:bg-zinc-800 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Simular Alerta"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alert History & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-zinc-800 overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl">
                <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Histórico de Eventos</h2>
            </div>
            <button className="text-sm font-bold text-indigo-600 hover:underline">Ver Relatório Completo</button>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              {[
                { time: '10:45', event: 'Bomba 01: Reinicialização Automática', type: 'INFO', status: 'Resolvido' },
                { time: '09:12', event: 'Porta Emergência: Aberta por > 5min', type: 'WARNING', status: 'Resolvido' },
                { time: 'Ontem', event: 'Queda de Tensão: Setor Garagem', type: 'ERROR', status: 'Resolvido' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all group">
                  <div className="text-sm font-black text-slate-400 w-16">{item.time}</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{item.event}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        item.type === 'ERROR' ? 'text-red-500' : item.type === 'WARNING' ? 'text-amber-500' : 'text-blue-500'
                      }`}>{item.type}</span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Bell className="w-24 h-24" />
            </div>
            <h3 className="text-xl font-black mb-4">Configuração de Alertas</h3>
            <p className="text-indigo-100 font-medium mb-6 text-sm">O síndico e a equipe de manutenção recebem notificações push em eventos críticos.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-xs font-bold">Notificações Push</span>
                <div className="w-8 h-4 bg-emerald-400 rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-xs font-bold">Alertas SMS</span>
                <div className="w-8 h-4 bg-white/20 rounded-full relative">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 border border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Status dos Sensores</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Sensores Ativos</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Uptime (30d)</span>
                <span className="text-sm font-bold text-emerald-600">99.98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Última Varredura</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Agora</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
