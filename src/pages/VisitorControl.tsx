import React, { useState } from 'react';
import { useStore, Visitor } from '../store';
import { 
  UserPlus, 
  Search, 
  QrCode, 
  Clock, 
  User, 
  Home,
  X,
  Calendar,
  ShieldCheck,
  MoreVertical,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VisitorControl() {
  const { visitors, addVisitor, revokeVisitor } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const [newVisitor, setNewVisitor] = useState<Omit<Visitor, 'id' | 'qrCode' | 'status'>>({
    name: '',
    document: '',
    type: 'VISITOR',
    apartment: '',
    tower: '',
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Default 24h
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVisitor(newVisitor);
    setIsModalOpen(false);
    setNewVisitor({
      name: '',
      document: '',
      type: 'VISITOR',
      apartment: '',
      tower: '',
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  };

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.apartment.includes(searchTerm)
  );

  const getStatus = (visitor: Visitor) => {
    if (visitor.status === 'EXPIRED' || visitor.status === 'USED') return visitor.status;
    return isAfter(new Date(), new Date(visitor.validUntil)) ? 'EXPIRED' : 'ACTIVE';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">Controle de Acesso</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mt-2 font-medium">Convites digitais e gestão de visitantes/prestadores.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Novo Convite
        </button>
      </header>

      {/* Search */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-[32px] border border-slate-100 dark:border-zinc-800 flex items-center gap-4 mb-8">
        <Search className="w-6 h-6 text-slate-400 ml-2" />
        <input 
          type="text"
          placeholder="Buscar por nome ou apartamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-medium"
        />
      </div>

      {/* Visitors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredVisitors.map((visitor) => {
            const status = getStatus(visitor);
            return (
              <motion.div
                key={visitor.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${
                  status !== 'ACTIVE' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-2xl ${
                    visitor.type === 'VISITOR' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                  }`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                      status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {status === 'ACTIVE' ? 'Ativo' : status === 'EXPIRED' ? 'Expirado' : 'Usado'}
                    </span>
                    <button 
                      onClick={() => revokeVisitor(visitor.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                  {visitor.name}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                    <Home className="w-4 h-4" />
                    <span>Apto {visitor.apartment} - {visitor.tower}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Válido até {format(new Date(visitor.validUntil), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{visitor.type === 'VISITOR' ? 'Visitante' : 'Prestador de Serviço'}</span>
                  </div>
                </div>

                {status === 'ACTIVE' && (
                  <button 
                    onClick={() => setSelectedVisitor(visitor)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-md shadow-indigo-200 dark:shadow-none active:scale-95"
                  >
                    <QrCode className="w-5 h-5" />
                    Ver Convite Digital
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-zinc-800"
            >
              <div className="p-8 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">Gerar Convite Digital</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">O QR Code será gerado com validade limitada.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                    <input 
                      required
                      type="text"
                      value={newVisitor.name}
                      onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Ex: Maria Oliveira"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Acesso</label>
                    <select 
                      value={newVisitor.type}
                      onChange={(e) => setNewVisitor({ ...newVisitor, type: e.target.value as Visitor['type'] })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="VISITOR">Visitante</option>
                      <option value="SERVICE_PROVIDER">Prestador de Serviço</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Apto</label>
                      <input 
                        required
                        type="text"
                        value={newVisitor.apartment}
                        onChange={(e) => setNewVisitor({ ...newVisitor, apartment: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="101"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Torre</label>
                      <input 
                        required
                        type="text"
                        value={newVisitor.tower}
                        onChange={(e) => setNewVisitor({ ...newVisitor, tower: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="A"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Válido até</label>
                    <input 
                      required
                      type="datetime-local"
                      value={newVisitor.validUntil.slice(0, 16)}
                      onChange={(e) => setNewVisitor({ ...newVisitor, validUntil: new Date(e.target.value).toISOString() })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white px-6 py-4 rounded-2xl font-bold transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95">
                    Gerar QR Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Display Modal */}
      <AnimatePresence>
        {selectedVisitor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 rounded-[40px] p-12 w-full max-w-md text-center shadow-2xl border border-slate-100 dark:border-zinc-800"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Convite Digital</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Compartilhe este código com o visitante.</p>
              </div>
              
              <div className="bg-white p-8 rounded-[32px] mb-8 flex items-center justify-center border-2 border-indigo-100 dark:border-zinc-700 shadow-inner">
                <QrCode className="w-48 h-48 text-slate-900" />
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visitante</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{selectedVisitor.name}</p>
                </div>
                <div className="flex justify-center gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apto</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedVisitor.apartment}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Torre</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedVisitor.tower}</p>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  Válido até {format(new Date(selectedVisitor.validUntil), "dd/MM HH:mm")}
                </div>
              </div>

              <button 
                onClick={() => setSelectedVisitor(null)}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
