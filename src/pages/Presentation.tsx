import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, X, LayoutDashboard, Wrench, DollarSign, 
  Users, Activity, Building, ClipboardCheck, ShieldCheck, Zap
} from 'lucide-react';

const slides = [
  {
    id: 'intro',
    title: 'IA COMPANY TEC',
    subtitle: 'Sistema de Gestão Inteligente e Integrado',
    icon: <ShieldCheck className="w-24 h-24 text-blue-400 mb-6" />,
    content: 'Uma plataforma completa para gestão de facilities, condomínios e prestação de serviços. Tudo o que você precisa em um único lugar, com dados em tempo real e inteligência operacional.',
    color: 'from-blue-900 to-slate-900'
  },
  {
    id: 'dashboard',
    title: 'Dashboard Interativo',
    subtitle: 'Visão 360º da sua operação',
    icon: <LayoutDashboard className="w-20 h-20 text-emerald-400 mb-6" />,
    content: 'Acompanhe métricas vitais através de tiles personalizáveis. Arraste, redimensione e organize sua área de trabalho para focar no que realmente importa.',
    features: ['Métricas em tempo real', 'Layout personalizável (Drag & Drop)', 'Previsão do tempo integrada', 'Acesso rápido a todas as ferramentas'],
    color: 'from-emerald-900 to-slate-900'
  },
  {
    id: 'operations',
    title: 'Gestão de Operações',
    subtitle: 'Controle total sobre serviços e manutenções',
    icon: <Wrench className="w-20 h-20 text-orange-400 mb-6" />,
    content: 'Gerencie ordens de serviço de ponta a ponta. Do chamado inicial até a conclusão, com histórico completo e relatórios detalhados.',
    features: ['Ordens de Serviço (OS)', 'Quadro Kanban interativo', 'Agenda e Calendário de compromissos', 'Aprovações pendentes'],
    color: 'from-orange-900 to-slate-900'
  },
  {
    id: 'financial',
    title: 'Financeiro & Faturamento',
    subtitle: 'Saúde financeira em tempo real',
    icon: <DollarSign className="w-20 h-20 text-green-400 mb-6" />,
    content: 'Controle receitas, despesas e inadimplência com transparência. Gere orçamentos profissionais e recibos com um clique.',
    features: ['Fluxo de Caixa', 'Geração de Orçamentos em PDF', 'Emissão de Recibos', 'Prestação de Contas e Inadimplência'],
    color: 'from-green-900 to-slate-900'
  },
  {
    id: 'inventory',
    title: 'Cadastros & Inventário',
    subtitle: 'Organização é a chave do sucesso',
    icon: <Users className="w-20 h-20 text-purple-400 mb-6" />,
    content: 'Mantenha o cadastro de clientes e produtos sempre atualizado. Controle o estoque de insumos e receba alertas de reposição.',
    features: ['Gestão de Clientes e Prédios', 'Catálogo de Produtos', 'Controle de Insumos e Estoque', 'Alertas de estoque baixo'],
    color: 'from-purple-900 to-slate-900'
  },
  {
    id: 'iot',
    title: 'Inovação & IoT',
    subtitle: 'Tecnologia a favor da eficiência',
    icon: <Activity className="w-20 h-20 text-cyan-400 mb-6" />,
    content: 'Monitore infraestruturas críticas em tempo real através de sensores IoT. Antecipe problemas e reduza custos operacionais.',
    features: ['Monitoramento Crítico (Bombas, Elevadores)', 'Eco-Monitoramento (Eficiência Energética)', 'Medição Individualizada (Água/Gás)', 'Alertas automáticos'],
    color: 'from-cyan-900 to-slate-900'
  },
  {
    id: 'facilities',
    title: 'Condomínio & Facilities',
    subtitle: 'Comunicação e conveniência',
    icon: <Building className="w-20 h-20 text-indigo-400 mb-6" />,
    content: 'Ferramentas modernas para a gestão condominial, facilitando a vida do síndico e dos moradores.',
    features: ['Assembleia Virtual com validade jurídica', 'Mural de Avisos segmentado', 'Locker Digital para encomendas', 'Controle de Acesso e Visitantes'],
    color: 'from-indigo-900 to-slate-900'
  },
  {
    id: 'maintenance',
    title: 'Manutenção Preventiva',
    subtitle: 'Conformidade e segurança',
    icon: <ClipboardCheck className="w-20 h-20 text-rose-400 mb-6" />,
    content: 'Garanta a conformidade com normas técnicas e facilite a rotina da equipe de manutenção em campo.',
    features: ['Checklist Inteligente (NBR 5674)', 'Cronograma automatizado', 'Gestão de Ativos via QR Code', 'Histórico de intervenções'],
    color: 'from-rose-900 to-slate-900'
  },
  {
    id: 'conclusion',
    title: 'Pronto para o Futuro',
    subtitle: 'Evolua a gestão do seu negócio',
    icon: <Zap className="w-24 h-24 text-yellow-400 mb-6" />,
    content: 'O sistema IA COMPANY TEC foi desenhado para crescer com você. Explore todas as funcionalidades e transforme sua operação hoje mesmo.',
    color: 'from-yellow-900 to-slate-900'
  }
];

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, navigate]);

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white overflow-hidden flex flex-col">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="text-white/50 font-mono text-sm tracking-widest uppercase">
          IA COMPANY TEC // Apresentação
        </div>
        <button 
          onClick={() => navigate('/')}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
          title="Fechar apresentação (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-40`}
          />
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-5xl w-full px-8 flex flex-col items-center text-center"
          >
            {slide.icon}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 drop-shadow-lg">
              {slide.title}
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-white/80 mb-8 tracking-wide">
              {slide.subtitle}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed mb-12 font-light">
              {slide.content}
            </p>

            {slide.features && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl text-left">
                {slide.features.map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4"
                  >
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                    <span className="text-lg font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center z-50">
        <div className="flex gap-4">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-4 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 rounded-full transition-colors backdrop-blur-md"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="p-4 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 rounded-full transition-colors backdrop-blur-md"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicators */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              title={`Ir para slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="text-white/50 text-sm font-medium">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
}
