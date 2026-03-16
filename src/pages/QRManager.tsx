import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../store';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { 
  QrCode, 
  Plus, 
  Trash2, 
  Download, 
  Building2, 
  MapPin,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { v4 as uuidv4 } from 'uuid';

export default function QRManager() {
  const { clients, updateClient, companyLogo, companyData } = useStore();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [qrSize, setQrSize] = useState(150);
  const qrTemplateRef = useRef<HTMLDivElement>(null);
  const [downloadingLocation, setDownloadingLocation] = useState<{id: string, name: string} | null>(null);

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newLocationName.trim()) return;

    const newLocation = {
      id: uuidv4(),
      name: newLocationName.trim()
    };

    const updatedLocations = [...(selectedClient.locations || []), newLocation];
    updateClient(selectedClientId, { ...selectedClient, locations: updatedLocations });
    setNewLocationName('');
    setIsModalOpen(false);
  };

  const handleDeleteLocation = (locationId: string) => {
    if (!selectedClient) return;
    const updatedLocations = (selectedClient.locations || []).filter(l => l.id !== locationId);
    updateClient(selectedClientId, { ...selectedClient, locations: updatedLocations });
  };

  const downloadQRCode = (locationId: string, locationName: string) => {
    setDownloadingLocation({ id: locationId, name: locationName });
    
    // Wait for React to render the hidden template
    setTimeout(async () => {
      if (qrTemplateRef.current) {
        try {
          const dataUrl = await toPng(qrTemplateRef.current, {
            quality: 1.0,
            pixelRatio: 3, // High resolution for printing
          });
          
          const downloadLink = document.createElement('a');
          downloadLink.download = `QR-${selectedClient?.name}-${locationName}.png`;
          downloadLink.href = dataUrl;
          downloadLink.click();
        } catch (err) {
          console.error('Error generating QR code image:', err);
          alert('Erro ao gerar a imagem do QR Code.');
        } finally {
          setDownloadingLocation(null);
        }
      }
    }, 100);
  };

  // Construct the public URL for the ticket form
  const getPublicUrl = (clientId: string, locationId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#/report?client=${clientId}&location=${locationId}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <QrCode className="w-8 h-8 text-primary" />
            Gestão de QR Codes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gere códigos QR para locais específicos do condomínio para abertura rápida de chamados.
          </p>
        </div>

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
      </div>

      {!selectedClientId ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Selecione um cliente</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Escolha um condomínio para gerenciar os pontos de acesso via QR Code.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Locais em {selectedClient?.name}
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Local
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tamanho do QR Code:</label>
            <input 
              type="range" 
              min="100" 
              max="500" 
              step="10"
              value={qrSize} 
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full max-w-xs accent-primary"
            />
            <span className="text-sm font-bold w-12">{qrSize}px</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedClient?.locations || []).map(loc => (
              <div key={loc.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-inner flex justify-center items-center overflow-hidden">
                    <QRCodeSVG 
                      id={`qr-${loc.id}`}
                      value={getPublicUrl(selectedClientId, loc.id)}
                      size={qrSize}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold">{loc.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 break-all px-4">
                      {getPublicUrl(selectedClientId, loc.id)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full pt-4">
                    <button
                      onClick={() => downloadQRCode(loc.id, loc.name)}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-primary hover:text-white transition-all font-bold flex items-center justify-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Baixar PNG
                    </button>
                    <a
                      href={getPublicUrl(selectedClientId, loc.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-blue-500 hover:text-white transition-all"
                      title="Testar Link"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-red-500 hover:text-white transition-all text-red-500"
                      title="Excluir Local"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {(selectedClient?.locations || []).length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
                <p className="text-gray-400">Nenhum local cadastrado. Adicione o primeiro local para gerar QR Codes.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Local para QR Code"
        maxWidth="sm"
      >
        <form onSubmit={handleAddLocation} className="space-y-4 p-2">
          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Nome do Local</label>
            <input
              required
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="Ex: Elevador Social 1, Salão de Festas, Garagem G1..."
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
              Adicionar
            </button>
          </div>
        </form>
      </Modal>

      {/* Hidden QR Code Template for Download */}
      {downloadingLocation && (
        <div className="fixed left-[-9999px] top-[-9999px]">
          <div 
            ref={qrTemplateRef}
            className="bg-slate-50 w-[800px] h-[1131px] flex flex-col items-center p-16 relative overflow-hidden"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Decorative Background Elements */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/5 rounded-full blur-3xl" />
            
            {/* Top/Bottom solid accent lines */}
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500" />
            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-emerald-500 via-purple-600 to-blue-600" />

            {/* Header */}
            <div className="relative z-10 w-full flex flex-col items-center mt-8 mb-12">
              {companyLogo ? (
                <img src={companyLogo} alt="Logo" className="h-32 object-contain mb-6 drop-shadow-xl" />
              ) : (
                <div className="h-32 w-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl flex items-center justify-center mb-6 text-white">
                  <Building2 className="w-16 h-16" />
                </div>
              )}
              <h1 className="text-3xl font-black text-slate-800 text-center uppercase tracking-[0.2em]">
                {companyData?.name || 'IA COMPANY TEC'}
              </h1>
            </div>

            {/* Main CTA */}
            <div className="text-center mb-12 relative z-10">
              <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 tracking-tight mb-4">
                SUPORTE RÁPIDO
              </h2>
              <p className="text-2xl text-slate-600 font-medium">
                Encontrou algum problema neste local?
              </p>
            </div>

            {/* QR Code Hero */}
            <div className="relative z-10 bg-white p-12 rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col items-center mb-12">
              {/* Corner accents (Scanner Reticle) */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-blue-600 rounded-tl-[3rem]" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-purple-600 rounded-tr-[3rem]" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-emerald-500 rounded-bl-[3rem]" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-blue-600 rounded-br-[3rem]" />
              
              <QRCodeSVG 
                value={getPublicUrl(selectedClientId, downloadingLocation.id)}
                size={360}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Location Badge */}
            <div className="relative z-10 bg-slate-900 text-white py-5 px-10 rounded-full shadow-2xl flex items-center gap-5 mb-auto max-w-full border border-slate-700">
              <MapPin className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedClient?.name}</span>
                <span className="text-2xl font-black truncate">{downloadingLocation.name}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 w-full flex items-center justify-center gap-6 mt-12 bg-white/80 py-6 px-8 rounded-3xl border border-white shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0 shadow-inner">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-wide">
                  Aponte a Câmera
                </h3>
                <p className="text-lg text-slate-600 font-medium">
                  Escaneie o código para abrir um chamado instantâneo
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
