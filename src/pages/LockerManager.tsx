import React, { useState } from 'react';
import { useStore, Package } from '../store';
import { 
  Package as PackageIcon, 
  Plus, 
  Search, 
  CheckCircle2, 
  QrCode, 
  Clock, 
  Truck, 
  User, 
  Home,
  X,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LockerManager() {
  const { packages, addPackage, pickupPackage } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const [newPkg, setNewPkg] = useState<Omit<Package, 'id' | 'receivedAt' | 'status' | 'qrCode'>>({
    residentName: '',
    apartment: '',
    tower: '',
    carrier: '',
    trackingCode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPackage(newPkg);
    setIsModalOpen(false);
    setNewPkg({
      residentName: '',
      apartment: '',
      tower: '',
      carrier: '',
      trackingCode: ''
    });
  };

  const filteredPackages = packages.filter(p => 
    p.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apartment.includes(searchTerm) ||
    p.carrier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">Locker Digital</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mt-2 font-medium">Gestão automatizada de encomendas e retiradas.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Registrar Pacote
        </button>
      </header>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 p-4 rounded-[32px] border border-slate-100 dark:border-zinc-800 flex items-center gap-4">
          <Search className="w-6 h-6 text-slate-400 ml-2" />
          <input 
            type="text"
            placeholder="Buscar por morador, apartamento ou transportadora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-medium"
          />
        </div>
        <div className="bg-indigo-600 rounded-[32px] p-6 text-white flex flex-col justify-center">
          <span className="text-xs font-black uppercase tracking-widest opacity-70">Pendentes</span>
          <span className="text-4xl font-black">{packages.filter(p => p.status === 'PENDING').length}</span>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${
                pkg.status === 'PICKED_UP' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${
                  pkg.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                }`}>
                  <PackageIcon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                    pkg.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {pkg.status === 'PENDING' ? 'Aguardando' : 'Retirado'}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {pkg.residentName}
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                  <Home className="w-4 h-4" />
                  <span>Apto {pkg.apartment} - {pkg.tower}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                  <Truck className="w-4 h-4" />
                  <span>{pkg.carrier} {pkg.trackingCode && `(${pkg.trackingCode})`}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Recebido em {format(new Date(pkg.receivedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                </div>
              </div>

              {pkg.status === 'PENDING' ? (
                <div className="flex gap-3 pt-6 border-t border-slate-50 dark:border-zinc-800">
                  <button 
                    onClick={() => setSelectedPackage(pkg)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white py-3 rounded-xl font-bold transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    QR Code
                  </button>
                  <button 
                    onClick={() => pickupPackage(pkg.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 dark:shadow-none"
                  >
                    <Fingerprint className="w-4 h-4" />
                    Retirar
                  </button>
                </div>
              ) : (
                <div className="pt-6 border-t border-slate-50 dark:border-zinc-800 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Retirado em {format(new Date(pkg.pickedUpAt!), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Register Modal */}
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
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">Registrar Encomenda</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">O morador será notificado automaticamente.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Morador</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="text"
                        value={newPkg.residentName}
                        onChange={(e) => setNewPkg({ ...newPkg, residentName: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl pl-12 pr-6 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Ex: João Silva"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Apto</label>
                      <input 
                        required
                        type="text"
                        value={newPkg.apartment}
                        onChange={(e) => setNewPkg({ ...newPkg, apartment: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="101"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Torre</label>
                      <input 
                        required
                        type="text"
                        value={newPkg.tower}
                        onChange={(e) => setNewPkg({ ...newPkg, tower: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="A"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Transportadora</label>
                    <div className="relative">
                      <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="text"
                        value={newPkg.carrier}
                        onChange={(e) => setNewPkg({ ...newPkg, carrier: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl pl-12 pr-6 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Ex: Amazon, Correios"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Código de Rastreio</label>
                    <input 
                      type="text"
                      value={newPkg.trackingCode}
                      onChange={(e) => setNewPkg({ ...newPkg, trackingCode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white px-6 py-4 rounded-2xl font-bold transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95">
                    Confirmar Recebimento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 rounded-[40px] p-12 w-full max-w-md text-center shadow-2xl border border-slate-100 dark:border-zinc-800"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">QR Code de Retirada</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Apresente este código no locker digital.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-zinc-800 p-8 rounded-[32px] mb-8 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-zinc-700">
                <QrCode className="w-48 h-48 text-slate-900 dark:text-white" />
              </div>

              <div className="space-y-2 mb-8">
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">ID da Encomenda</p>
                <p className="text-xl font-mono font-bold text-indigo-600">{selectedPackage.qrCode}</p>
              </div>

              <button 
                onClick={() => setSelectedPackage(null)}
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
