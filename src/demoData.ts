import { v4 as uuidv4 } from 'uuid';
import { Client, Product, Ticket, Quote, Receipt, Cost, Appointment, ChecklistItem, Payment, LegalAgreement, ConsumptionReading, DigitalFolderItem, Notice, Package, Visitor, CriticalEvent, EnergyRecord, Assembly, ScheduledMaintenance } from './store';

const client1Id = uuidv4();

export const demoClients: Client[] = [
  {
    id: client1Id,
    name: 'Condomínio Residencial das Flores',
    document: '12.345.678/0001-90',
    contactPerson: 'João Silva (Síndico)',
    phone: '(11) 98765-4321',
    email: 'sindico@resdasflores.com.br',
    address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    notes: 'Cliente VIP, atendimento prioritário.'
  }
];

export const demoProducts: Product[] = [
  { id: uuidv4(), code: 'PRD-001', name: 'Contatora 220V 32A', description: 'Contatora tripolar para motores', price: 150.00, unit: 'UN' },
  { id: uuidv4(), code: 'PRD-002', name: 'Disjuntor Bipolar 20A', description: 'Disjuntor termomagnético curva C', price: 45.50, unit: 'UN' },
  { id: uuidv4(), code: 'PRD-003', name: 'Cabo Flexível 2.5mm', description: 'Cabo de cobre isolado 750V', price: 180.00, unit: 'RL' },
  { id: uuidv4(), code: 'PRD-004', name: 'Lâmpada LED Tubular 18W', description: 'Lâmpada LED T8 120cm', price: 25.00, unit: 'UN' },
];

export const demoChecklistItems: ChecklistItem[] = [
  { id: uuidv4(), task: 'Verificar extintores (Validade e Pressão)', category: 'Segurança' },
  { id: uuidv4(), task: 'Testar luzes de emergência', category: 'Segurança' },
  { id: uuidv4(), task: 'Limpeza da caixa d\'água', category: 'Hidráulica' },
  { id: uuidv4(), task: 'Verificar bombas de recalque', category: 'Hidráulica' },
];

const generateData = () => {
  const months = [
    { year: 2025, month: 9 }, // Oct
    { year: 2025, month: 10 }, // Nov
    { year: 2025, month: 11 }, // Dec
    { year: 2026, month: 0 }, // Jan
    { year: 2026, month: 1 }, // Feb
    { year: 2026, month: 2 }, // Mar
  ];

  const formatDate = (year: number, month: number, day: number) => {
    return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
  };

  const formatDateTime = (year: number, month: number, day: number, hour: number, minute: number) => {
    return new Date(Date.UTC(year, month, day, hour, minute)).toISOString();
  };

  const tickets: Ticket[] = [];
  const quotes: Quote[] = [];
  const receipts: Receipt[] = [];
  const costs: Cost[] = [];
  const appointments: Appointment[] = [];
  const payments: Payment[] = [];
  const consumptionReadings: ConsumptionReading[] = [];
  const digitalFolder: DigitalFolderItem[] = [];
  const notices: Notice[] = [];
  const packages: Package[] = [];
  const visitors: Visitor[] = [];
  const energyData: EnergyRecord[] = [];
  const assemblies: Assembly[] = [];
  const criticalEvents: CriticalEvent[] = [];
  const scheduledMaintenances: ScheduledMaintenance[] = [];

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  months.forEach((m, index) => {
    const { year, month } = m;
    
    // Tickets
    tickets.push({
      id: uuidv4(),
      title: `Manutenção Preventiva Mensal - ${monthNames[month]}`,
      type: 'PREVENTIVA',
      status: 'CONCLUIDO',
      clientId: client1Id,
      date: formatDate(year, month, 5),
      technician: 'Carlos Silva',
      observations: 'Checklist mensal realizado.',
      checklistResults: []
    });
    tickets.push({
      id: uuidv4(),
      title: `Reparo Lâmpadas - ${monthNames[month]}`,
      type: 'CORRETIVA',
      status: 'CONCLUIDO',
      clientId: client1Id,
      date: formatDate(year, month, 15),
      technician: 'Roberto Alves',
      observations: 'Troca de lâmpadas queimadas.',
      reportedProblem: 'Lâmpadas queimadas no corredor.',
      serviceReport: 'Trocadas 3 lâmpadas.'
    });

    // Quotes
    if (index % 2 === 0) {
      quotes.push({
        id: uuidv4(),
        clientId: client1Id,
        date: formatDate(year, month, 10),
        status: 'APPROVED',
        items: [
          { id: uuidv4(), description: 'Material Elétrico', quantity: 1, unitPrice: 250.00, total: 250.00 },
        ],
        totalValue: 250.00
      });
    }

    // Receipts
    receipts.push({
      id: uuidv4(),
      clientId: client1Id,
      date: formatDate(year, month, 5),
      value: 5000.00,
      description: `Taxa Condominial - ${monthNames[month]}/${year}`
    });

    // Costs
    costs.push({ id: uuidv4(), description: 'Conta de Água', value: 1200.00, date: formatDate(year, month, 10), category: 'Água' });
    costs.push({ id: uuidv4(), description: 'Conta de Luz', value: 800.00, date: formatDate(year, month, 12), category: 'Energia' });
    costs.push({ id: uuidv4(), description: 'Manutenção Elevadores', value: 600.00, date: formatDate(year, month, 15), category: 'Manutenção' });
    costs.push({ id: uuidv4(), description: 'Limpeza', value: 1500.00, date: formatDate(year, month, 20), category: 'Limpeza' });

    // Appointments
    appointments.push({
      id: uuidv4(),
      title: `Reunião de Condomínio - ${monthNames[month]}`,
      start: formatDateTime(year, month, 10, 19, 0),
      end: formatDateTime(year, month, 10, 20, 0),
      type: 'MEETING'
    });

    // Payments
    payments.push({
      id: uuidv4(),
      clientId: client1Id,
      amount: 5000.00,
      dueDate: formatDate(year, month, 5),
      status: 'PAID',
      paymentDate: formatDate(year, month, 4),
      reference: `${String(month + 1).padStart(2, '0')}/${year}`
    });

    // Consumption
    consumptionReadings.push({
      id: uuidv4(),
      clientId: client1Id,
      type: 'WATER',
      previousValue: 1000 + index * 100,
      currentValue: 1000 + (index + 1) * 100,
      consumption: 100,
      date: formatDate(year, month, 28),
      unit: 'm³',
      billed: true
    });
    consumptionReadings.push({
      id: uuidv4(),
      clientId: client1Id,
      type: 'GAS',
      previousValue: 500 + index * 50,
      currentValue: 500 + (index + 1) * 50,
      consumption: 50,
      date: formatDate(year, month, 28),
      unit: 'm³',
      billed: true
    });

    // Digital Folder
    digitalFolder.push({
      id: uuidv4(),
      type: 'BALANCE_SHEET',
      title: `Balancete ${monthNames[month]}/${year}`,
      date: formatDate(year, month, 28),
      fileUrl: '#',
      status: 'VALIDATED',
      signatures: []
    });

    // Notices
    notices.push({
      id: uuidv4(),
      title: `Aviso de Manutenção - ${monthNames[month]}`,
      content: 'Realizaremos manutenção preventiva nos elevadores.',
      date: formatDate(year, month, 2),
      category: 'MAINTENANCE',
      clientId: client1Id
    });

    // Packages
    packages.push({
      id: uuidv4(),
      residentName: 'João Silva',
      apartment: '101',
      tower: 'A',
      carrier: 'Correios',
      receivedAt: formatDateTime(year, month, 15, 14, 0),
      pickedUpAt: formatDateTime(year, month, 15, 18, 0),
      status: 'PICKED_UP',
      qrCode: uuidv4()
    });
    packages.push({
      id: uuidv4(),
      residentName: 'Maria Souza',
      apartment: '202',
      tower: 'B',
      carrier: 'Loggi',
      receivedAt: formatDateTime(year, month, 20, 10, 0),
      pickedUpAt: formatDateTime(year, month, 21, 9, 0),
      status: 'PICKED_UP',
      qrCode: uuidv4()
    });

    // Visitors
    visitors.push({
      id: uuidv4(),
      name: 'Pedro Santos',
      type: 'VISITOR',
      apartment: '101',
      tower: 'A',
      validUntil: formatDateTime(year, month, 10, 23, 59),
      qrCode: uuidv4(),
      status: 'USED'
    });

    // Energy Data
    energyData.push({
      month: monthNames[month],
      consumption: 4000 + Math.floor(Math.random() * 1000),
      solarGeneration: 1000 + Math.floor(Math.random() * 500),
      sensorSavings: 400 + Math.floor(Math.random() * 100),
      costWithoutTech: 5000 + Math.floor(Math.random() * 1000),
      actualCost: 3500 + Math.floor(Math.random() * 1000)
    });
  });

  // Add some pending/active items for the current month
  packages.push({
    id: uuidv4(),
    residentName: 'Carlos Pereira',
    apartment: '303',
    tower: 'A',
    carrier: 'Mercado Livre',
    receivedAt: new Date().toISOString(),
    status: 'PENDING',
    qrCode: uuidv4()
  });

  criticalEvents.push({
    id: uuidv4(),
    device: 'Bomba de Recalque 01',
    location: 'Subsolo',
    type: 'PUMP',
    status: 'NORMAL',
    lastUpdate: new Date().toISOString(),
    description: 'Operando normalmente.'
  });

  assemblies.push({
    id: uuidv4(),
    title: 'Assembleia Geral Ordinária',
    description: 'Aprovação de contas e eleição de síndico.',
    date: formatDate(2026, 2, 20),
    status: 'UPCOMING',
    options: [
      { id: uuidv4(), text: 'Aprovar' },
      { id: uuidv4(), text: 'Rejeitar' }
    ],
    votes: [],
    legalValidityHash: 'hash123'
  });

  scheduledMaintenances.push({
    id: uuidv4(),
    clientId: client1Id,
    standardId: 'std1',
    item: 'Elevadores',
    frequency: 'Mensal',
    nextDate: formatDate(2026, 2, 25),
    status: 'PENDING',
    category: 'Mecânica'
  });

  return {
    tickets, quotes, receipts, costs, appointments, payments, consumptionReadings, digitalFolder, notices, packages, visitors, energyData, assemblies, criticalEvents, scheduledMaintenances
  };
};

const data = generateData();

export const demoTickets = data.tickets;
export const demoQuotes = data.quotes;
export const demoReceipts = data.receipts;
export const demoCosts = data.costs;
export const demoAppointments = data.appointments;
export const demoPayments = data.payments;
export const demoConsumptionReadings = data.consumptionReadings;
export const demoDigitalFolder = data.digitalFolder;
export const demoNotices = data.notices;
export const demoPackages = data.packages;
export const demoVisitors = data.visitors;
export const demoEnergyData = data.energyData;
export const demoAssemblies = data.assemblies;
export const demoCriticalEvents = data.criticalEvents;
export const demoScheduledMaintenances = data.scheduledMaintenances;
export const demoLegalAgreements: LegalAgreement[] = [];
