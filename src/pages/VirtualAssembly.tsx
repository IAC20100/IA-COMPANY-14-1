import React, { useState, useMemo } from 'react';
import { useStore, Assembly, AssemblyOption } from '../store';
import { 
  Gavel, 
  ShieldCheck, 
  Lock, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  ChevronRight, 
  ArrowLeft,
  Info,
  AlertTriangle,
  FileCheck,
  Fingerprint,
  History,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VirtualAssembly() {
  const { assemblies, castVote, closeAssembly } = useStore();
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<string | null>(null);
  const [votedAssemblyId, setVotedAssemblyId] = useState<string | null>(null);

  const selectedAssembly = useMemo(() => 
    assemblies.find(a => a.id === selectedAssemblyId),
    [assemblies, selectedAssemblyId]
  );

  const handleVote = (assemblyId: string, optionId: string) => {
    // In a real app, we'd get the user name from auth
    castVote(assemblyId, optionId, 'João Silva');
    setVotedAssemblyId(assemblyId);
    setTimeout(() => setVotedAssemblyId(null), 3000);
  };

  const getStatusColor = (status: Assembly['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'UPCOMING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'CLOSED': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: Assembly['status']) => {
    switch (status) {
      case 'ACTIVE': return 'Em Votação';
      case 'UPCOMING': return 'Agendada';
      case 'CLOSED': return 'Encerrada';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Assembleia Virtual</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Votação híbrida com validade jurídica e criptografia de ponta.</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Criptografia Ativa</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Assembly List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Sessões</h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              {assemblies.length} Total
            </span>
          </div>
          
          {assemblies.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-slate-100 dark:border-zinc-800 text-center">
              <Gavel className="w-12 h-12 text-slate-200 dark:text-zinc-800 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-zinc-500 font-medium">Nenhuma assembleia registrada.</p>
            </div>
          ) : (
            assemblies.map((assembly) => (
              <motion.button
                key={assembly.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedAssemblyId(assembly.id)}
                className={`w-full text-left p-6 rounded-[32px] border transition-all ${
                  selectedAssemblyId === assembly.id
                    ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 text-white'
                    : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 text-slate-900 dark:text-white shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                    selectedAssemblyId === assembly.id ? 'bg-white/20 border-white/30 text-white' : getStatusColor(assembly.status)
                  }`}>
                    {getStatusLabel(assembly.status)}
                  </div>
                  <Clock className={`w-4 h-4 ${selectedAssemblyId === assembly.id ? 'text-white/60' : 'text-slate-400'}`} />
                </div>
                <h3 className="font-black text-lg mb-1 line-clamp-1">{assembly.title}</h3>
                <p className={`text-xs font-medium ${selectedAssemblyId === assembly.id ? 'text-white/70' : 'text-slate-500'}`}>
                  {format(new Date(assembly.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </p>
              </motion.button>
            ))
          )}
        </div>

        {/* Main Content: Assembly Details & Voting */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedAssembly ? (
              <motion.div
                key={selectedAssembly.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-8 md:p-12 border-b border-slate-50 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(selectedAssembly.status)}`}>
                      {getStatusLabel(selectedAssembly.status)}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <Users className="w-4 h-4" />
                      {selectedAssembly.votes.length} Participantes
                    </div>
                    <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold">
                      <Fingerprint className="w-4 h-4" />
                      ID: {selectedAssembly.legalValidityHash}
                    </div>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">{selectedAssembly.title}</h2>
                  <p className="text-slate-500 dark:text-zinc-400 text-lg leading-relaxed">{selectedAssembly.description}</p>
                </div>

                {/* Voting Area */}
                <div className="p-8 md:p-12 bg-slate-50/50 dark:bg-zinc-900/50">
                  {selectedAssembly.status === 'ACTIVE' ? (
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-white">Cédula de Votação Digital</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sua escolha é criptografada e anônima</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {selectedAssembly.options.map((option) => (
                          <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleVote(selectedAssembly.id, option.id)}
                            className="w-full group relative flex items-center justify-between p-6 bg-white dark:bg-zinc-800 rounded-3xl border border-slate-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                          >
                            <span className="text-lg font-bold text-slate-800 dark:text-zinc-100">{option.text}</span>
                            <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-zinc-600 group-hover:border-indigo-500 flex items-center justify-center transition-colors">
                              <div className="w-4 h-4 rounded-full bg-indigo-600 scale-0 group-hover:scale-100 transition-transform" />
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-[32px] flex gap-4">
                        <Info className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
                          Ao confirmar seu voto, uma assinatura digital única será gerada vinculada ao seu CPF, garantindo a validade jurídica conforme a Lei 14.309/22.
                        </p>
                      </div>
                    </div>
                  ) : selectedAssembly.status === 'CLOSED' ? (
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                            <BarChart3 className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 dark:text-white">Resultado da Votação</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Auditado e Finalizado</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
                          <FileCheck className="w-4 h-4" />
                          Baixar Ata Registrada
                        </button>
                      </div>

                      <div className="space-y-6">
                        {selectedAssembly.options.map((option) => {
                          const voteCount = selectedAssembly.votes.filter(v => v.optionId === option.id).length;
                          const percentage = selectedAssembly.votes.length > 0 
                            ? (voteCount / selectedAssembly.votes.length) * 100 
                            : 0;
                          
                          return (
                            <div key={option.id} className="space-y-2">
                              <div className="flex justify-between text-sm font-black text-slate-700 dark:text-zinc-300">
                                <span>{option.text}</span>
                                <span>{voteCount} votos ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="h-full bg-indigo-600 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-12 pt-8 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Trilha de Auditoria (Blockchain Sim)</h4>
                        <div className="space-y-3">
                          {selectedAssembly.votes.slice(0, 3).map((vote) => (
                            <div key={vote.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">{vote.userName}</span>
                              </div>
                              <code className="text-[10px] text-indigo-500 font-mono">{vote.signature}</code>
                            </div>
                          ))}
                          <button className="w-full py-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                            Ver todos os 124 registros de auditoria
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-amber-200 mx-auto mb-4" />
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Aguardando Início</h3>
                      <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                        Esta assembleia está agendada para o dia {format(new Date(selectedAssembly.date), "dd/MM/yyyy")}. 
                        O link para a transmissão ao vivo será liberado 15 minutos antes.
                      </p>
                      <button className="mt-8 bg-white border border-slate-200 text-slate-900 px-8 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
                        Adicionar ao Calendário
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50/50 dark:bg-zinc-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-zinc-800">
                <Gavel className="w-20 h-20 text-slate-200 dark:text-zinc-800 mb-6" />
                <h3 className="text-2xl font-black text-slate-400 dark:text-zinc-600">Selecione uma Assembleia</h3>
                <p className="text-slate-400 dark:text-zinc-600 mt-2">Escolha uma sessão na lista ao lado para ver detalhes e votar.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Success Modal for Voting */}
      <AnimatePresence>
        {votedAssemblyId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-zinc-900 p-12 rounded-[48px] text-center max-w-md shadow-2xl">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Voto Confirmado!</h2>
              <p className="text-slate-500 dark:text-zinc-400 mb-8 font-medium">
                Sua participação foi registrada com sucesso e assinada digitalmente. O comprovante foi enviado para seu e-mail.
              </p>
              <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700">
                <code className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  HASH: {assemblies.find(a => a.id === votedAssemblyId)?.legalValidityHash}
                </code>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
