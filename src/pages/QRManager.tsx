import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Plus, 
  Trash2, 
  Download, 
  Building2, 
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { v4 as uuidv4 } from 'uuid';

export default function QRManager() {
  const { clients, updateClient } = useStore();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [qrSize, setQrSize] = useState(150);

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
    const svg = document.getElementById(`qr-${locationId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${selectedClient?.name}-${locationName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
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
    </div>
  );
}
