import React, { useState } from 'react';
import { useStore, TicketStatus, Ticket } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Wrench, CheckCircle, AlertCircle, Calendar, User, Edit, Plus, ArrowLeft, MoreVertical, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLUMNS: { id: TicketStatus; title: string; icon: any; color: string; glowColor: string }[] = [
  { id: 'APROVADO', title: 'Aprovado', icon: CheckCircle, color: 'text-blue-600', glowColor: 'shadow-blue-500/10' },
  { id: 'AGUARDANDO_MATERIAL', title: 'Aguardando Material', icon: AlertCircle, color: 'text-orange-600', glowColor: 'shadow-orange-500/10' },
  { id: 'REALIZANDO', title: 'Realizando', icon: Wrench, color: 'text-purple-600', glowColor: 'shadow-purple-500/10' },
  { id: 'CONCLUIDO', title: 'Concluído', icon: CheckCircle, color: 'text-emerald-600', glowColor: 'shadow-emerald-500/10' },
];

export default function KanbanBoard() {
  const navigate = useNavigate();
  const { tickets, clients, updateTicket } = useStore();
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    setDraggedTicketId(ticketId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ticketId);
    
    // Create a ghost image or handle opacity
    setTimeout(() => {
      const el = document.getElementById(`ticket-${ticketId}`);
      if (el) el.classList.add('opacity-40', 'scale-95');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, ticketId: string) => {
    setDraggedTicketId(null);
    const el = document.getElementById(`ticket-${ticketId}`);
    if (el) el.classList.remove('opacity-40', 'scale-95');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TicketStatus) => {
    e.preventDefault();
    if (!draggedTicketId) return;

    const ticket = tickets.find(t => t.id === draggedTicketId);
    if (ticket && (ticket.status || 'APROVADO') !== status) {
      updateTicket(ticket.id, { ...ticket, status });
    }
    setDraggedTicketId(null);
  };

  return (
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative flex flex-col">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="currentColor" className="text-white/5" fillOpacity="0.5" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="currentColor" className="text-white/10" fillOpacity="0.5" />
        </svg>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white border border-white/10 shadow-xl backdrop-blur-md active:scale-95"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div>
            <h1 className="text-6xl font-light tracking-tight text-white">Kanban</h1>
            <p className="text-xl text-white/60 mt-2 font-light">Arraste os cards para atualizar o status</p>
          </div>
        </div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link 
            to="/tickets/new"
            className="bg-white/10 hover:bg-white/20 text-white px-10 py-5 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all rounded-2xl shadow-2xl font-bold tracking-widest uppercase text-sm"
          >
            <Plus className="w-6 h-6" />
            Nova Tarefa
          </Link>
        </motion.div>
      </header>

      <div className="flex-1 flex gap-8 overflow-x-auto pb-8 snap-x relative z-10 custom-scrollbar">
        {COLUMNS.map((column, colIndex) => {
          const columnTickets = tickets.filter(t => (t.status || 'APROVADO') === column.id);
          const Icon = column.icon;

          return (
            <motion.div 
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIndex * 0.1 }}
              className="flex-1 min-w-[350px] max-w-[450px] flex flex-col rounded-3xl bg-zinc-50 border border-zinc-200 snap-center shadow-sm overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="p-6 flex items-center justify-between border-b border-zinc-200 bg-zinc-100/50">
                <div className={`flex items-center gap-3 font-bold text-lg tracking-tight ${column.color}`}>
                  <div className={`p-2 rounded-lg bg-white border border-zinc-200 ${column.glowColor} shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {column.title}
                </div>
                <span className="px-4 py-1 rounded-full text-sm font-black bg-zinc-200/50 border border-zinc-200 text-zinc-500">
                  {columnTickets.length}
                </span>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar min-h-[200px]">
                <AnimatePresence mode="popLayout">
                  {columnTickets.map(ticket => {
                    const client = clients.find(c => c.id === ticket.clientId);
                    return (
                      <motion.div
                        layout
                        key={ticket.id}
                        id={`ticket-${ticket.id}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, ticket.id)}
                        onDragEnd={(e: any) => handleDragEnd(e, ticket.id)}
                        className="bg-white hover:bg-zinc-50 p-6 rounded-2xl border border-zinc-200 cursor-grab active:cursor-grabbing transition-all group relative shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {ticket.osNumber && (
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-blue-200">
                                {ticket.osNumber}
                              </span>
                            )}
                            <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-zinc-200">
                              {ticket.type}
                            </span>
                            {ticket.maintenanceCategory && (
                              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-emerald-200 truncate max-w-[150px]" title={ticket.maintenanceCategory}>
                                {ticket.maintenanceCategory}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/tickets/${ticket.id}/edit`}
                              className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-zinc-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {ticket.title || client?.name || 'Cliente Desconhecido'}
                        </h3>
                        {ticket.title && (
                          <p className="text-sm text-zinc-500 font-medium mb-4">{client?.name}</p>
                        )}
                        
                        <div className="space-y-3 mt-6 pt-6 border-t border-zinc-100">
                          <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                            <Calendar className="w-4 h-4 shrink-0 opacity-40" />
                            {new Date(ticket.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                            <User className="w-4 h-4 shrink-0 opacity-40" />
                            <span className="truncate">{ticket.technician}</span>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <Link 
                            to={`/tickets/${ticket.id}`}
                            className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors group/link"
                          >
                            <span>Ver Detalhes</span>
                            <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {columnTickets.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-40 flex flex-col items-center justify-center text-zinc-300 border-2 border-dashed border-zinc-100 rounded-3xl p-8 text-center"
                  >
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm font-bold uppercase tracking-widest">Vazio</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
