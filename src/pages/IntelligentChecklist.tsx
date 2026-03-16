import React, { useState, useMemo, useRef } from 'react';
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
  Check,
  Download,
  ArrowLeft
} from 'lucide-react';
import { format, isAfter, parseISO, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Modal } from '../components/Modal';
import html2pdf from 'html2pdf.js';

export default function IntelligentChecklist() {
  const { 
    clients, 
    scheduledMaintenances, 
    generateSchedulesForClient, 
    updateScheduledMaintenance,
    addScheduledMaintenance,
    addNotification,
    companyData,
    companyLogo
  } = useStore();

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [newTask, setNewTask] = useState({
    item: '',
    category: 'Geral',
    frequency: 'Mensal' as 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual',
    nextDate: format(new Date(), 'yyyy-MM-dd')
  });

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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    addScheduledMaintenance({
      clientId: selectedClientId,
      standardId: 'custom-' + Date.now(),
      item: newTask.item,
      category: newTask.category,
      frequency: newTask.frequency,
      nextDate: newTask.nextDate,
      status: 'PENDING'
    });

    setIsModalOpen(false);
    setNewTask({
      item: '',
      category: 'Geral',
      frequency: 'Mensal',
      nextDate: format(new Date(), 'yyyy-MM-dd')
    });
    
    addNotification({
      title: 'Tarefa Adicionada',
      message: 'Nova tarefa preventiva adicionada com sucesso.',
      type: 'SUCCESS'
    });
  };

  const generatePDF = () => {
    if (!pdfRef.current || !selectedClient) return;
    setIsGeneratingPdf(true);

    const opt = {
      margin: [10, 10],
      filename: `Checklist_Preventiva_${selectedClient.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfRef.current).save().then(() => {
      setIsGeneratingPdf(false);
    });
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
          {selectedClientId && (
            <>
              <button
                onClick={() => setSelectedClientId('')}
                className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              
              {clientSchedules.length > 0 && (
                <>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-primary text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                    Nova Tarefa
                  </button>
                  <button
                    onClick={generatePDF}
                    disabled={isGeneratingPdf}
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {isGeneratingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Gerar PDF
                  </button>
                </>
              )}
            </>
          )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 hover:shadow-xl transition-all group flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Office%20Building.png" 
                alt="Building 3D" 
                className="w-32 h-32 object-contain mb-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
              />
              <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-2">{client.name}</h3>
              <p className="text-sm text-gray-500 font-medium">{client.address}</p>
              
              <div className="mt-6 w-full py-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                Selecionar Prédio
              </div>
            </button>
          ))}
          {clients.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
              <p className="text-gray-400">Nenhum prédio cadastrado. Adicione um cliente primeiro.</p>
            </div>
          )}
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

      {/* Modal Nova Tarefa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Tarefa Preventiva"
        maxWidth="md"
      >
        <form onSubmit={handleAddTask} className="space-y-4 p-2">
          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Item / Descrição</label>
            <input
              required
              type="text"
              value={newTask.item}
              onChange={(e) => setNewTask({ ...newTask, item: e.target.value })}
              placeholder="Ex: Inspeção das bombas de recalque"
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Categoria</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="Geral">Geral</option>
                <option value="Hidráulica">Hidráulica</option>
                <option value="Elétrica">Elétrica</option>
                <option value="Elevadores">Elevadores</option>
                <option value="Incêndio">Incêndio</option>
                <option value="Limpeza">Limpeza</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Frequência</label>
              <select
                value={newTask.frequency}
                onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value as any })}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Próxima Data</label>
            <input
              required
              type="date"
              value={newTask.nextDate}
              onChange={(e) => setNewTask({ ...newTask, nextDate: e.target.value })}
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 text-gray-500 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white px-8 py-2 rounded-xl font-bold transition-all"
            >
              Adicionar Tarefa
            </button>
          </div>
        </form>
      </Modal>

      {/* Hidden PDF Template */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        <div ref={pdfRef} className="p-10 bg-white text-black w-[210mm] min-h-[297mm] mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider">{companyData?.name || 'IA COMPANY TEC'}</h1>
              <p className="text-sm text-gray-600">Relatório de Inspeção e Manutenção Preventiva</p>
            </div>
            {companyLogo && <img src={companyLogo} alt="Logo" className="h-16 object-contain" />}
          </div>

          {/* Info */}
          <div className="bg-gray-100 p-4 rounded-lg mb-8 border border-gray-300">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-gray-700">Condomínio/Prédio:</span>
                <p className="text-lg">{selectedClient?.name}</p>
              </div>
              <div>
                <span className="font-bold text-gray-700">Data da Inspeção:</span>
                <p className="text-lg">___/___/20___</p>
              </div>
              <div>
                <span className="font-bold text-gray-700">Responsável Técnico:</span>
                <p className="text-lg">___________________________</p>
              </div>
              <div>
                <span className="font-bold text-gray-700">Assinatura:</span>
                <p className="text-lg">___________________________</p>
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <h2 className="text-xl font-bold mb-4 uppercase border-b border-gray-300 pb-2">Itens de Verificação</h2>
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="bg-gray-200 text-sm">
                <th className="border border-gray-400 p-2 w-12 text-center">OK</th>
                <th className="border border-gray-400 p-2 w-12 text-center">NOK</th>
                <th className="border border-gray-400 p-2 w-12 text-center">N/A</th>
                <th className="border border-gray-400 p-2">Item / Descrição</th>
                <th className="border border-gray-400 p-2 w-48">Observações</th>
              </tr>
            </thead>
            <tbody>
              {clientSchedules.map((schedule, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-400 p-2 text-center"><div className="w-4 h-4 border border-gray-500 mx-auto rounded-sm"></div></td>
                  <td className="border border-gray-400 p-2 text-center"><div className="w-4 h-4 border border-gray-500 mx-auto rounded-sm"></div></td>
                  <td className="border border-gray-400 p-2 text-center"><div className="w-4 h-4 border border-gray-500 mx-auto rounded-sm"></div></td>
                  <td className="border border-gray-400 p-2">
                    <div className="font-bold text-sm">{schedule.item}</div>
                    <div className="text-xs text-gray-600">{schedule.category} - {schedule.frequency}</div>
                  </td>
                  <td className="border border-gray-400 p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Notes */}
          <div className="mt-8 border-t border-gray-300 pt-4 text-xs text-gray-500 text-center">
            Documento gerado automaticamente pelo sistema de gestão integrada.
            <br />
            A conformidade com a NBR 5674 é de responsabilidade do síndico/gestor.
          </div>
        </div>
      </div>
    </div>
  );
}
