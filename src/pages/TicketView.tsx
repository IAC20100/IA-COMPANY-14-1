import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Download, Printer, Edit, CheckCircle2, XCircle, DollarSign, Camera, MapPin, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { generatePdf } from '../utils/pdfGenerator';

export default function TicketView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, clients, checklistItems, companyLogo, companyData, companySignature, updateTicket } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const ticket = tickets.find(t => t.id === id);
  const client = clients.find(c => c.id === ticket?.clientId);

  if (!ticket) {
    return <div className="p-8 text-center text-gray-500">Ordem de Serviço não encontrada.</div>;
  }

  const handleApproveBudget = () => {
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor de orçamento válido.');
      return;
    }
    updateTicket(ticket.id, { 
      ...ticket, 
      status: 'APROVADO', 
      budgetAmount: amount, 
      budgetApproved: true 
    });
  };

  const handleRejectBudget = () => {
    updateTicket(ticket.id, { ...ticket, status: 'REJEITADO' });
  };

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    setIsGenerating(true);
    try {
      let fileName = '';
      if (ticket.id === '123') {
        fileName = 'OS_CORRETIVA_Condominio_Flores_20-02-2026.pdf';
      } else {
        const dateStr = new Date(ticket.date).toLocaleDateString('pt-BR').replace(/\//g, '-');
        const safeName = client?.name ? client.name.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_') : 'Tarefa';
        fileName = `OS_${ticket.type}_${safeName}_${dateStr}.pdf`;
      }

      await generatePdf(element, fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente usar o botão "Imprimir" no topo da página como alternativa.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative flex flex-col print:bg-white print:text-black print:p-0 print:m-0 print:block">
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden print:hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" fillOpacity="0.1" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="white" fillOpacity="0.05" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto w-full relative z-10">
        {isGenerating && (
          <div className="fixed inset-0 bg-[#004a7c]/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-white font-black uppercase tracking-widest text-sm">Gerando Ordem de Serviço...</p>
          </div>
        )}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-white">Detalhes da Ordem de Serviço</h1>
          </div>
          <div className="flex gap-3">
            {ticket.status === 'PENDENTE_APROVACAO' && (
              <span className="bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                Aguardando Aprovação
              </span>
            )}
            <Link 
              to={`/tickets/${ticket.id}/edit`}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10 backdrop-blur-md"
            >
              <Edit className="w-4 h-4" /> Editar
            </Link>
            <button 
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10 backdrop-blur-md"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button 
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/20 backdrop-blur-md shadow-lg"
            >
              <Download className="w-4 h-4" /> {isGenerating ? 'Gerando...' : 'Baixar PDF'}
            </button>
          </div>
        </div>

        <div 
          ref={printRef} 
          className="bg-white/5 backdrop-blur-md text-white rounded-3xl border border-white/10 shadow-2xl p-8 print:bg-white print:text-black print:shadow-none print:border-none print:p-12 print:block print:w-full print:max-w-none print:rounded-none"
        >
        {/* Alerta de Aprovação Pendente */}
        {ticket.status === 'PENDENTE_APROVACAO' && (
          <div className="mb-8 bg-amber-500/20 border border-amber-500/30 rounded-2xl p-6 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-amber-500 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-200">Aprovação de Orçamento</h3>
                  <p className="text-sm text-amber-100/70">Defina o valor do orçamento para que o serviço possa ser iniciado.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">R$</span>
                  <input 
                    type="number" 
                    placeholder="0,00"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/50 w-40 font-bold"
                  />
                </div>
                <button 
                  onClick={handleApproveBudget}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-5 h-5" /> Aprovar
                </button>
                <button 
                  onClick={handleRejectBudget}
                  className="bg-red-500/20 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-bold transition-all border border-red-500/30"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Cabeçalho do Relatório */}
        <div className="border-b border-white/10 pb-6 mb-6 flex justify-between items-start break-inside-avoid print:border-gray-300 print:pb-4 print:mb-4">
          <div className="flex items-center gap-4">
            {companyLogo && (
              <img src={companyLogo} alt="Logo da Empresa" className="h-16 w-auto object-contain print:brightness-0" />
            )}
            <div>
              <div className="flex items-center gap-3 mb-1">
                {ticket.osNumber && (
                  <span className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs font-bold tracking-wider border border-white/10 print:bg-gray-200 print:text-gray-800 print:border-gray-300">
                    {ticket.osNumber}
                  </span>
                )}
                <h2 className="text-2xl font-bold text-white uppercase print:text-gray-900">
                  {ticket.title || 'Relatório de Manutenção'}
                </h2>
              </div>
              <p className="text-white/60 font-medium mt-1 print:text-gray-500">
                {ticket.type === 'CORRETIVA' ? 'Manutenção Corretiva' : 'Manutenção Preventiva / Checklist'}
                {ticket.maintenanceCategory && ` • ${ticket.maintenanceCategory}`}
                {ticket.maintenanceSubcategory && ` - ${ticket.maintenanceSubcategory}`}
              </p>
              {companyData && (
                <div className="mt-2 text-sm text-white/40 print:text-gray-500">
                  <p className="font-bold text-white/60 print:text-gray-700">{companyData.name}</p>
                  <p>CNPJ: {companyData.document} | Tel: {companyData.phone}</p>
                  <p>{companyData.email} | {companyData.address}</p>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/40 print:text-gray-500">Data da OS</p>
            <p className="font-bold text-white print:text-gray-900">{new Date(ticket.date).toLocaleDateString('pt-BR')}</p>
            <p className="text-sm text-white/40 mt-2 print:text-gray-500">Técnico Responsável</p>
            <p className="font-bold text-white print:text-gray-900">{ticket.technician}</p>
          </div>
        </div>

        {/* Informações do Cliente */}
        {client && (
          <div className="mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 print:bg-transparent print:border-gray-300 print:border print:p-4 break-inside-avoid">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xs font-black text-white/20 uppercase tracking-widest print:text-gray-500">Dados do Cliente</h3>
              {ticket.location && (
                <div className="flex items-center gap-2 bg-primary/20 text-primary-light px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/30">
                  <MapPin className="w-3 h-3" /> {ticket.location}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              <div className="break-inside-avoid">
                <p className="text-xs text-white/40 print:text-gray-500">Nome / Condomínio</p>
                <p className="font-medium text-white print:text-black">{client.name}</p>
              </div>
              <div className="break-inside-avoid">
                <p className="text-xs text-white/40 print:text-gray-500">CNPJ / CPF</p>
                <p className="font-medium text-white print:text-black">{client.document || '-'}</p>
              </div>
              <div className="break-inside-avoid">
                <p className="text-xs text-white/40 print:text-gray-500">Responsável</p>
                <p className="font-medium text-white print:text-black">{client.contactPerson || '-'}</p>
              </div>
              <div className="break-inside-avoid">
                <p className="text-xs text-white/40 print:text-gray-500">Telefone</p>
                <p className="font-medium text-white print:text-black">{client.phone}</p>
              </div>
              <div className="break-inside-avoid">
                <p className="text-xs text-white/40 print:text-gray-500">E-mail</p>
                <p className="font-medium text-white print:text-black">{client.email || '-'}</p>
              </div>
              <div className="col-span-2 break-inside-avoid">
                <p className="text-xs text-white/40 print:text-gray-500">Endereço</p>
                <p className="font-medium text-white print:text-black">{client.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Informações do Relatante (QR Code) */}
        {ticket.reportedBy && (
          <div className="mb-8 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 print:bg-transparent print:border-gray-300 print:border print:p-4 break-inside-avoid">
            <h3 className="text-xs font-black text-blue-400/40 uppercase tracking-widest mb-3 print:text-gray-500">Relatado por (QR Code)</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40 print:text-gray-500">Nome / Unidade</p>
                  <p className="font-medium text-white print:text-black">{ticket.reportedBy}</p>
                </div>
              </div>
              {ticket.budgetAmount && (
                <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 print:text-gray-500">Orçamento Aprovado</p>
                    <p className="font-bold text-emerald-400 print:text-black">R$ {ticket.budgetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conteúdo Específico */}
        {ticket.type === 'CORRETIVA' ? (
          <div className="space-y-6">
            <div className="break-inside-avoid mb-6">
              <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 print:text-gray-500 print:border-gray-300">Problema Relatado</h3>
              <p className="text-white/80 whitespace-pre-wrap print:text-black">{ticket.reportedProblem}</p>
            </div>

            <div className="break-inside-avoid mb-6">
              <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 print:text-gray-500 print:border-gray-300">Relato da Ordem de Serviço</h3>
              <p className="text-white/80 whitespace-pre-wrap print:text-black">{ticket.serviceReport}</p>
            </div>

            {ticket.productsForQuote && (
              <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 print:bg-transparent print:border-gray-300 print:border break-inside-avoid">
                <h3 className="text-xs font-black text-amber-400/60 uppercase tracking-widest mb-2 print:text-gray-500">Produtos para Orçamento</h3>
                <p className="text-amber-200 whitespace-pre-wrap print:text-black">{ticket.productsForQuote}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-4 border-b border-white/5 pb-2 print:text-gray-500 print:border-gray-300">Resultados do Checklist</h3>
            
            <div className="overflow-hidden border border-white/10 rounded-2xl print:border-gray-300 print:border">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 text-white/60 print:bg-gray-100 print:text-gray-700">
                    <th className="p-3 font-bold uppercase tracking-wider border-b border-white/5 print:border-gray-300">Tarefa</th>
                    <th className="p-3 font-bold uppercase tracking-wider border-b border-white/5 w-24 text-center print:border-gray-300">Status</th>
                    <th className="p-3 font-bold uppercase tracking-wider border-b border-white/5 print:border-gray-300">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-gray-300">
                  {ticket.checklistResults?.map(result => {
                    const item = checklistItems.find(i => i.id === result.taskId);
                    if (!item) return null;
                    
                    return (
                      <tr key={result.taskId} className="break-inside-avoid">
                        <td className="p-3 text-white/80 font-medium print:text-black">{item.task}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                            result.status === 'OK' ? 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-800' :
                            result.status === 'NOK' ? 'bg-red-500/20 text-red-400 print:bg-red-100 print:text-red-800' :
                            'bg-white/5 text-white/40 print:bg-gray-100 print:text-gray-800'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="p-3 text-white/40 print:text-gray-700">{result.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Observações Gerais */}
        {ticket.observations && (
          <div className="mt-8 break-inside-avoid">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-2 border-b border-white/5 pb-1 print:text-gray-500 print:border-gray-300">Observações Gerais</h3>
            <p className="text-white/80 whitespace-pre-wrap print:text-black">{ticket.observations}</p>
          </div>
        )}

        {/* Histórico de Manutenção */}
        <div className="mt-8 break-inside-avoid">
          <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-4 border-b border-white/5 pb-1 print:text-gray-500 print:border-gray-300">Histórico de Manutenção</h3>
          <div className="space-y-3">
            {tickets.filter(t => t.clientId === ticket.clientId && t.id !== ticket.id).slice(0, 3).map(prevTicket => (
              <div key={prevTicket.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 print:bg-transparent print:border-gray-300 print:border">
                <div>
                  <p className="font-bold text-white/80 print:text-black">{prevTicket.title}</p>
                  <p className="text-xs text-white/40 print:text-gray-500">{new Date(prevTicket.date).toLocaleDateString('pt-BR')} • {prevTicket.type}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                  prevTicket.status === 'CONCLUIDO' ? 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-800' : 'bg-white/5 text-white/40 print:bg-gray-100 print:text-gray-800'
                }`}>
                  {prevTicket.status}
                </span>
              </div>
            ))}
            {tickets.filter(t => t.clientId === ticket.clientId && t.id !== ticket.id).length === 0 && (
              <p className="text-sm text-white/40 italic print:text-gray-500">Nenhum histórico anterior registrado para este cliente.</p>
            )}
          </div>
        </div>

        {/* Assinaturas */}
        <div className="mt-16 pt-8 grid grid-cols-2 gap-8 break-inside-avoid print:mt-12 print:pt-4">
          <div className="text-center">
            <div className="flex flex-col items-center mb-2">
              <div className="h-16 flex items-end justify-center w-full relative">
                {companySignature && (
                  <img src={companySignature} alt="Assinatura" className="max-h-full max-w-full object-contain mb-[-8px] relative z-10 print:brightness-0" />
                )}
              </div>
              <div className="border-t border-white/20 w-3/4 mx-auto print:border-gray-400"></div>
            </div>
            <p className="font-bold text-white print:text-gray-900">Síndico</p>
            <p className="text-xs text-white/40 uppercase tracking-widest print:text-gray-500">Assinatura</p>
          </div>
          <div className="text-center">
            <div className="h-16"></div>
            <div className="border-t border-white/20 w-3/4 mx-auto mb-2 print:border-gray-400"></div>
            <p className="font-bold text-white print:text-gray-900">Cliente</p>
            <p className="text-xs text-white/40 uppercase tracking-widest print:text-gray-500">Assinatura</p>
          </div>
        </div>

        {/* Fotos do Serviço (Anexos) */}
        {(ticket.images?.length || 0) > 0 || ticket.photoBefore ? (
          <div className="mt-16 print:mt-12 print:break-before-page">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-4 border-b border-white/5 pb-1 print:text-gray-500 print:border-gray-300">Anexo: Fotos do Serviço</h3>
            <div className="grid grid-cols-2 gap-4 print:gap-4">
              {ticket.photoBefore && (
                <div className="rounded-2xl overflow-hidden border border-amber-500/30 print:border-gray-300 print:border break-inside-avoid relative">
                  <img src={ticket.photoBefore} alt="Foto Inicial" className="w-full h-auto object-contain max-h-64 print:max-h-56" />
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Foto Inicial
                  </div>
                </div>
              )}
              {ticket.images?.map((img, index) => (
                <div key={index} className="rounded-2xl overflow-hidden border border-white/10 print:border-gray-300 print:border break-inside-avoid">
                  <img src={img} alt={`Foto ${index + 1}`} className="w-full h-auto object-contain max-h-64 print:max-h-56" />
                </div>
              ))}
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}
