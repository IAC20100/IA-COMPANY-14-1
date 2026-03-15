import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { NBR5674_STANDARDS } from '../constants/maintenance';
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  RefreshCw, 
  Building2,
  Bell,
  Check
} from 'lucide-react';
import { format, isAfter, parseISO, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function IntelligentChecklist() {
  const { 
    clients, 
    scheduledMaintenances, 
    generateSchedulesForClient, 
    updateScheduledMaintenance,
    addNotification
  } = useStore();

  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const clientSchedules = useMemo(() => {
    return scheduledMaintenances.filter(m => m.clientId === selectedClientId);
  }, [scheduledMaintenances, selectedClientId]);

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  const handleGenerate = () => {
    if (!selectedClientId) return;
    generateSchedulesForClient(selectedClientId);
    addNotification({
      title: 'Cronograma Gerado',
      message: `Cronograma NBR 5674 gerado com sucesso para ${selectedClient?.name}.`,
      type: 'SUCCESS'
    });
  };

  const handleMarkAsDone = (id: string, frequency: string) => {
    const lastDone = new Date().toISOString().split('T')[0];
    const nextDateObj = new Date();
    
    if (frequency === 'Mensal') nextDateObj.setMonth(nextDateObj.getMonth() + 1);
    else if (frequency === 'Trimestral') nextDateObj.setMonth(nextDateObj.getMonth() + 3);
    else if (frequency === 'Semestral') nextDateObj.setMonth(nextDateObj.getMonth() + 6);
    else nextDateObj.setFullYear(nextDateObj.getFullYear() + 1);

    const nextDate = nextDateObj.toISOString().split('T')[0];

    updateScheduledMaintenance(id, {
      lastDone,
      nextDate,
      status: 'DONE'
    });

    addNotification({
      title: 'Manutenção Concluída',
      message: `Manutenção registrada. Próxima data: ${format(nextDateObj, 'dd/MM/yyyy')}`,
      type: 'INFO'
    });
  };

  const getStatusIcon = (status: string, nextDate: string) => {
    const isOverdue = isAfter(new Date(), parseISO(nextDate));
    if (isOverdue) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (status === 'DONE') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    return <Clock className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Checklist Inteligente (NBR 5674)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Cronograma automático de manutenções preventivas obrigatórias.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[250px]"
          >
            <option value="">Selecionar Cliente/Condomínio</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>

          {selectedClientId && clientSchedules.length === 0 && (
            <button
              onClick={handleGenerate}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <RefreshCw className="w-4 h-4" />
              Gerar Cronograma
            </button>
          )}
        </div>
      </div>

      {!selectedClientId ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Selecione um cliente</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Escolha um condomínio ou cliente para visualizar e gerenciar o cronograma de manutenções preventivas NBR 5674.
          </p>
        </div>
      ) : clientSchedules.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Nenhum cronograma ativo</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Este cliente ainda não possui um cronograma de manutenção inteligente baseado na NBR 5674.
          </p>
          <button
            onClick={handleGenerate}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Gerar Cronograma Automático
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientSchedules.map(schedule => {
            const isOverdue = isAfter(new Date(), parseISO(schedule.nextDate));
            
            return (
              <div 
                key={schedule.id}
                className={`bg-white dark:bg-zinc-900 border ${isOverdue ? 'border-red-200 dark:border-red-900/30' : 'border-gray-200 dark:border-zinc-800'} rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}
              >
                {isOverdue && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Atrasado
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl group-hover:scale-110 transition-transform">
                    {getStatusIcon(schedule.status, schedule.nextDate)}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {schedule.frequency}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1">{schedule.item}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
                  {NBR5674_STANDARDS.find(s => s.id === schedule.standardId)?.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Última Realização:</span>
                    <span className="font-medium">{schedule.lastDone ? format(parseISO(schedule.lastDone), 'dd/MM/yyyy') : 'Nunca'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Próxima Manutenção:</span>
                    <span className={`font-bold ${isOverdue ? 'text-red-500' : 'text-primary'}`}>
                      {format(parseISO(schedule.nextDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleMarkAsDone(schedule.id, schedule.frequency)}
                  className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 hover:bg-primary hover:text-white transition-all font-bold flex items-center justify-center gap-2 group/btn"
                >
                  <Check className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                  Marcar como Realizado
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedClientId && clientSchedules.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl text-blue-600">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-100">Alertas Inteligentes Ativados</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              O sistema monitora automaticamente as datas de vencimento. Você receberá notificações 7 dias antes de cada manutenção e alertas imediatos em caso de atraso.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
