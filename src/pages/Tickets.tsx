import { useState } from 'react';
import { useStore, TicketStatus } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye, Edit, Hammer, Clock, ShieldAlert, Bell, ArrowLeft, Wrench, ExternalLink, Filter, Search } from 'lucide-react';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'motion/react';

export default function Tickets() {
  const navigate = useNavigate();
  const { tickets, clients, deleteTicket, updateTicket } = useStore();
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const client = clients.find(c => c.id === ticket.clientId);
    const searchStr = `${ticket.osNumber || ''} ${ticket.title} ${client?.name} ${ticket.technician} ${ticket.type} ${ticket.maintenanceCategory || ''} ${ticket.maintenanceSubcategory || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const preventivas = tickets.filter(t => t.type === 'PREVENTIVA').length;
  const corretivas = tickets.filter(t => t.type === 'CORRETIVA').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative flex flex-col">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" fillOpacity="0.1" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="white" fillOpacity="0.05" />
        </svg>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white border border-white/10 backdrop-blur-md shadow-xl active:scale-95"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div>
            <h1 className="text-6xl font-light tracking-tight">Ordens de Serviço</h1>
            <p className="text-xl opacity-60 mt-2 font-light">Gerencie as manutenções e atendimentos</p>
          </div>
        </div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to="/tickets/new"
            className="bg-white/10 hover:bg-white/20 text-white px-10 py-5 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all rounded-2xl shadow-2xl font-bold tracking-widest uppercase text-sm"
          >
            <Plus className="w-6 h-6" />
            Nova Ordem
          </Link>
        </motion.div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-10"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex items-center justify-between shadow-2xl group hover:bg-white/10 transition-all">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Corretivas</p>
              <p className="text-5xl font-black text-white">{corretivas}</p>
            </div>
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-400 border border-red-500/20 shadow-lg shadow-red-500/10 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-10 h-10" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex items-center justify-between shadow-2xl group hover:bg-white/10 transition-all">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Preventivas</p>
              <p className="text-5xl font-black text-white">{preventivas}</p>
            </div>
            <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform">
              <Clock className="w-10 h-10" />
            </div>
          </motion.div>
        </div>

        {/* Search and List Section */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/10 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-bold tracking-tight">Atividade Recente</h2>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="text"
                placeholder="Buscar ordens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
          </div>

          <div className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {filteredTickets.slice().reverse().map((ticket, index) => {
                const client = clients.find(c => c.id === ticket.clientId);
                const isCorretiva = ticket.type === 'CORRETIVA';

                return (
                  <motion.div 
                    layout
                    key={ticket.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 hover:bg-white/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
                  >
                    <div className="flex items-start gap-6">
                      <div className={`mt-1 p-4 rounded-2xl shadow-lg ${isCorretiva ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                        <Wrench className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          {ticket.osNumber && (
                            <span className="px-3 py-1 bg-white/10 text-white/70 rounded-lg text-sm font-bold tracking-wider border border-white/10">
                              {ticket.osNumber}
                            </span>
                          )}
                          <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
                            {ticket.title || `Manutenção ${ticket.type}`}
                          </h3>
                        </div>
                        <p className="text-lg text-white/50 font-medium mb-3">
                          {client?.name || 'Local não especificado'}
                          {ticket.maintenanceCategory && ` • ${ticket.maintenanceCategory}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-2 text-white/30 font-bold text-sm uppercase tracking-wider">
                            <Clock className="w-4 h-4" />
                            {new Date(ticket.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                          <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
                            ticket.status === 'CONCLUIDO' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                            ticket.status === 'REALIZANDO' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                            ticket.status === 'PENDENTE_APROVACAO' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20 animate-pulse' :
                            ticket.status === 'REJEITADO' ? 'bg-red-500/20 text-red-400 border-red-500/20' :
                            'bg-zinc-500/20 text-zinc-400 border-zinc-500/20'
                          }`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className="text-white/20 text-sm font-medium">Técnico: {ticket.technician}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:self-center self-end">
                      <Link 
                        to={`/tickets/${ticket.id}`}
                        className="p-3 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5"
                        title="Visualizar"
                      >
                        <Eye className="w-6 h-6" />
                      </Link>
                      <Link 
                        to={`/tickets/${ticket.id}/edit`}
                        className="p-3 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5"
                        title="Editar"
                      >
                        <Edit className="w-6 h-6" />
                      </Link>
                      <button 
                        onClick={() => setTicketToDelete(ticket.id)}
                        className="p-3 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-white/5"
                        title="Excluir"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredTickets.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                <Search className="w-16 h-16 text-white/10" />
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white/40">Nenhuma ordem encontrada</p>
                  <p className="text-white/20">Tente ajustar sua busca ou crie uma nova ordem.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <Modal 
        isOpen={!!ticketToDelete} 
        onClose={() => setTicketToDelete(null)} 
        title="Confirmar Exclusão"
        maxWidth="sm"
        glass
      >
        <div className="space-y-8 p-2">
          <div className="flex items-center gap-4 text-amber-400 bg-amber-400/10 p-4 rounded-2xl border border-amber-400/20">
            <ShieldAlert className="w-8 h-8 shrink-0" />
            <p className="font-medium leading-relaxed">Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.</p>
          </div>
          
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
            <button 
              onClick={() => setTicketToDelete(null)}
              className="px-8 py-4 text-white/60 hover:text-white font-bold transition-colors"
            >
              CANCELAR
            </button>
            <button 
              onClick={() => {
                if (ticketToDelete) deleteTicket(ticketToDelete);
                setTicketToDelete(null);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95"
            >
              EXCLUIR
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
