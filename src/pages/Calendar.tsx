import React, { useState } from 'react';
import { useStore, Appointment } from '../store';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, Calendar as CalendarIcon, Clock, AlignLeft, X, ArrowLeft, Info, CalendarDays, MapPin, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Calendar() {
  const navigate = useNavigate();
  const { appointments, tickets, clients, addAppointment, deleteAppointment } = useStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0] + 'T09:00');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0] + 'T10:00');
  const [type, setType] = useState<'MEETING' | 'OTHER'>('MEETING');
  const [notes, setNotes] = useState('');

  // Map tickets to calendar events
  const ticketEvents = tickets.map(t => {
    const client = clients.find(c => c.id === t.clientId);
    const osPrefix = t.osNumber ? `${t.osNumber} - ` : 'OS: ';
    return {
      id: `ticket-${t.id}`,
      title: `${osPrefix}${client?.name || 'Desconhecido'}`,
      start: new Date(t.date + 'T08:00:00'),
      end: new Date(t.date + 'T18:00:00'),
      allDay: true,
      resource: { type: 'TICKET', originalId: t.id, clientName: client?.name, osNumber: t.osNumber, maintenanceCategory: t.maintenanceCategory }
    };
  });

  // Map appointments to calendar events
  const appointmentEvents = appointments.map(a => ({
    id: a.id,
    title: a.title,
    start: new Date(a.start),
    end: new Date(a.end),
    allDay: false,
    resource: { type: a.type, notes: a.notes }
  }));

  const allEvents = [...ticketEvents, ...appointmentEvents];

  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    setStartDate(format(start, "yyyy-MM-dd'T'HH:mm"));
    setEndDate(format(end, "yyyy-MM-dd'T'HH:mm"));
    setIsAdding(true);
    setSelectedEvent(null);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addAppointment({
      title,
      start: new Date(startDate).toISOString(),
      end: new Date(endDate).toISOString(),
      type,
      notes
    });

    setIsAdding(false);
    setTitle('');
    setNotes('');
  };

  const handleDelete = () => {
    if (selectedEvent && selectedEvent.resource.type !== 'TICKET') {
      deleteAppointment(selectedEvent.id);
      setSelectedEvent(null);
    }
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = 'rgba(24, 24, 27, 0.8)'; // zinc-900 for meetings
    let border = '1px solid rgba(24, 24, 27, 0.9)';
    let glow = '0 0 15px rgba(24, 24, 27, 0.2)';
    
    if (event.resource.type === 'TICKET') {
      backgroundColor = 'rgba(24, 24, 27, 0.9)'; // zinc-900 for tickets
      border = '1px solid rgba(24, 24, 27, 1)';
      glow = '0 0 15px rgba(24, 24, 27, 0.3)';
    } else if (event.resource.type === 'OTHER') {
      backgroundColor = 'rgba(113, 113, 122, 0.8)'; // zinc-500 for other
      border = '1px solid rgba(113, 113, 122, 0.9)';
      glow = '0 0 15px rgba(113, 113, 122, 0.2)';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '12px',
        opacity: 1,
        color: 'white',
        border,
        display: 'block',
        fontWeight: '700',
        padding: '6px 10px',
        fontSize: '0.8rem',
        backdropFilter: 'blur(8px)',
        boxShadow: glow,
        transition: 'all 0.2s ease'
      }
    };
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
            <h1 className="text-6xl font-light tracking-tight text-white">Agenda</h1>
            <p className="text-xl text-white/60 mt-2 font-light">Compromissos e Ordens de Serviço</p>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setStartDate(new Date().toISOString().split('T')[0] + 'T09:00');
            setEndDate(new Date().toISOString().split('T')[0] + 'T10:00');
            setIsAdding(true);
            setSelectedEvent(null);
          }}
          className="bg-white/10 hover:bg-white/20 text-white px-10 py-5 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all rounded-2xl shadow-2xl font-bold tracking-widest uppercase text-sm"
        >
          <Plus className="w-6 h-6" /> 
          Novo Compromisso
        </motion.button>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-zinc-50 rounded-[2.5rem] border border-zinc-200 p-10 shadow-sm relative z-10 overflow-hidden flex flex-col"
      >
        <style>{`
          .rbc-calendar { font-family: 'Inter', system-ui, sans-serif; border: none; color: #18181b; }
          .rbc-month-view, .rbc-time-view, .rbc-header { border-color: #e4e4e7 !important; }
          .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row { border-color: #f4f4f5 !important; }
          .rbc-time-content > * + * > * { border-color: #f4f4f5 !important; }
          .rbc-timeslot-group { border-color: #f4f4f5 !important; min-height: 80px; }
          .rbc-day-slot .rbc-time-slot { border-color: #f4f4f5 !important; }
          .rbc-off-range-bg { background-color: #fafafa !important; }
          .rbc-today { background-color: #eff6ff !important; }
          .rbc-header { 
            padding: 20px 8px !important; 
            font-size: 0.7rem !important; 
            font-weight: 900 !important; 
            color: #71717a !important;
            background: transparent !important;
            border-bottom: 1px solid #e4e4e7 !important;
            text-transform: uppercase;
            letter-spacing: 0.2em;
          }
          .rbc-button-link { font-weight: 700 !important; color: inherit !important; }
          .rbc-toolbar { margin-bottom: 40px !important; }
          .rbc-toolbar button { 
            border: 1px solid #e4e4e7 !important; 
            border-radius: 16px !important; 
            padding: 12px 24px !important; 
            font-weight: 700 !important; 
            font-size: 0.9rem !important; 
            color: #3f3f46 !important;
            background: white !important;
            transition: all 0.3s !important;
            margin-right: 10px !important;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .rbc-toolbar button:hover { background-color: #f4f4f5 !important; transform: translateY(-1px); }
          .rbc-toolbar button.rbc-active { background-color: #18181b !important; color: white !important; border-color: #09090b !important; box-shadow: 0 0 20px rgba(24, 24, 27, 0.3); }
          .rbc-event { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; }
          .rbc-event:hover { transform: translateY(-4px) scale(1.03) !important; z-index: 50 !important; }
          .rbc-show-more { font-weight: 800 !important; font-size: 0.75rem !important; color: #18181b !important; opacity: 0.8; padding: 4px 8px; }
          .rbc-time-view { border-radius: 32px; overflow: hidden; border: 1px solid #e4e4e7; background: white; }
          .rbc-month-view { border-radius: 32px; overflow: hidden; border: 1px solid #e4e4e7; background: white; }
          .rbc-time-header-content { border-left: 1px solid #e4e4e7 !important; }
          .rbc-time-content { border-top: 1px solid #e4e4e7 !important; }
          .rbc-label { color: #71717a !important; font-size: 0.75rem !important; font-weight: 700 !important; }
          .rbc-current-time-indicator { background-color: #ef4444 !important; height: 2px !important; }
        `}</style>
        <BigCalendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="pt-BR"
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "Não há eventos neste período."
          }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
        />
      </motion.div>

      {/* Add Appointment Modal */}
      <Modal 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        title="Novo Compromisso"
        maxWidth="sm"
        glass
      >
        <form onSubmit={handleSave} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Título do Evento</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-4 outline-none transition-all text-white text-lg placeholder:text-white/10"
              placeholder="Ex: Reunião de Planejamento"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Início</label>
              <input 
                type="datetime-local" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-4 outline-none transition-all text-white text-lg"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Término</label>
              <input 
                type="datetime-local" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-4 outline-none transition-all text-white text-lg"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Categoria</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-4 outline-none transition-all text-white text-lg appearance-none cursor-pointer"
            >
              <option value="MEETING" className="bg-[#004a7c]">Reunião</option>
              <option value="OTHER" className="bg-[#004a7c]">Outro</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Observações</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-6 py-4 outline-none transition-all text-white text-lg min-h-[120px] resize-none placeholder:text-white/10"
              placeholder="Detalhes adicionais..."
            />
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-8 py-4 text-white/40 hover:text-white font-black tracking-widest transition-all uppercase text-xs"
            >
              CANCELAR
            </button>
            <button 
              type="submit"
              className="bg-white/10 hover:bg-white/20 text-white px-12 py-4 rounded-2xl font-black tracking-widest border border-white/30 backdrop-blur-md transition-all active:scale-95 shadow-2xl"
            >
              SALVAR EVENTO
            </button>
          </div>
        </form>
      </Modal>

      {/* View Event Modal */}
      <Modal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        title="Detalhes do Evento"
        maxWidth="sm"
        glass
      >
        {selectedEvent && (
          <div className="space-y-10">
            <div className="flex items-start gap-6">
              <div className={`p-5 rounded-[2rem] shrink-0 shadow-2xl ${
                selectedEvent.resource.type === 'TICKET' ? 'bg-zinc-900/20 text-zinc-900 border border-zinc-900/30' :
                selectedEvent.resource.type === 'MEETING' ? 'bg-zinc-900/20 text-zinc-900 border border-zinc-900/30' :
                'bg-zinc-500/20 text-zinc-500 border border-zinc-500/30'
              }`}>
                <CalendarIcon className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight leading-tight">{selectedEvent.title}</h3>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mt-3">
                  {selectedEvent.resource.type === 'TICKET' ? 'Ordem de Serviço' : 
                   selectedEvent.resource.type === 'MEETING' ? 'Reunião' : 'Outro'}
                  {selectedEvent.resource.osNumber && ` • ${selectedEvent.resource.osNumber}`}
                  {selectedEvent.resource.maintenanceCategory && ` • ${selectedEvent.resource.maintenanceCategory}`}
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6 text-white/80 bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                <Clock className="w-8 h-8 text-white/20 shrink-0" />
                <div className="text-xl font-medium leading-tight">
                  {selectedEvent.allDay ? (
                    <span className="font-black tracking-widest uppercase text-sm text-white/40">Dia Inteiro</span>
                  ) : (
                    <div className="space-y-1">
                      <div>{format(selectedEvent.start, "dd/MM/yyyy 'às' HH:mm")}</div>
                      <div className="text-xs font-black uppercase tracking-widest text-white/20">até</div>
                      <div>{format(selectedEvent.end, "dd/MM/yyyy 'às' HH:mm")}</div>
                    </div>
                  )}
                </div>
              </div>

              {selectedEvent.resource.type === 'TICKET' && selectedEvent.resource.clientName && (
                <div className="flex items-center gap-6 text-white/80 bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <User className="w-8 h-8 text-white/20 shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/20 mb-1">Cliente</p>
                    <p className="text-xl font-bold">{selectedEvent.resource.clientName}</p>
                  </div>
                </div>
              )}

              {selectedEvent.resource.notes && (
                <div className="flex items-start gap-6 text-white/80 bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                  <AlignLeft className="w-8 h-8 text-white/20 mt-1 shrink-0" />
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{selectedEvent.resource.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
              {selectedEvent.resource.type !== 'TICKET' && (
                <button 
                  onClick={handleDelete}
                  className="px-8 py-4 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-2xl font-black tracking-widest uppercase text-xs border border-rose-500/20 transition-all"
                >
                  EXCLUIR
                </button>
              )}
              {selectedEvent.resource.type === 'TICKET' && (
                <button 
                  onClick={() => navigate(`/tickets/${selectedEvent.resource.originalId}`)}
                  className="px-8 py-4 bg-zinc-900/10 text-zinc-900 hover:bg-zinc-900/20 rounded-2xl font-black tracking-widest uppercase text-xs border border-zinc-900/20 transition-all"
                >
                  VER ORDEM
                </button>
              )}
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-12 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black tracking-widest uppercase text-xs border border-white/30 transition-all"
              >
                FECHAR
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
