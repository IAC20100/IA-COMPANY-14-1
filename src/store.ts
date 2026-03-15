import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './lib/supabase';
import { NBR5674_STANDARDS } from './constants/maintenance';
import {
  demoClients, demoProducts, demoChecklistItems, demoTickets,
  demoQuotes, demoReceipts, demoCosts, demoAppointments,
  demoPayments, demoLegalAgreements, demoConsumptionReadings,
  demoDigitalFolder, demoNotices, demoPackages, demoVisitors,
  demoEnergyData, demoAssemblies, demoCriticalEvents, demoScheduledMaintenances
} from './demoData';

export type Client = {
  id: string;
  name: string;
  document?: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  locations?: { id: string; name: string }[];
};

export type ChecklistItem = {
  id: string;
  task: string;
  category: string;
  clientId?: string; // Legacy: If undefined, it's a global checklist item
  clientIds?: string[]; // New: Array of client IDs. If empty or undefined, and clientId is also undefined, it's global.
};

export type TicketType = 'PREVENTIVA' | 'CORRETIVA';

export type TicketStatus = 'PENDENTE_APROVACAO' | 'APROVADO' | 'AGUARDANDO_MATERIAL' | 'REALIZANDO' | 'CONCLUIDO' | 'REJEITADO';

export type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Quote = {
  id: string;
  clientId: string;
  date: string;
  items: QuoteItem[];
  totalValue: number;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
};

export type Receipt = {
  id: string;
  clientId: string;
  date: string;
  value: number;
  description: string;
};

export type Cost = {
  id: string;
  description: string;
  value: number;
  date: string;
  category: string;
};

export type Appointment = {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'TICKET' | 'MEETING' | 'OTHER';
  ticketId?: string;
  notes?: string;
};

export type Ticket = {
  id: string;
  osNumber?: string;
  title?: string;
  type: TicketType;
  status?: TicketStatus;
  maintenanceCategory?: string;
  maintenanceSubcategory?: string;
  clientId: string;
  date: string;
  technician: string;
  observations: string;
  
  // QR Code / Public Reporting fields
  reportedBy?: string;
  location?: string;
  photoBefore?: string;
  budgetAmount?: number;
  budgetApproved?: boolean;
  
  // Corretiva fields
  reportedProblem?: string;
  productsForQuote?: string;
  serviceReport?: string;
  
  // Preventiva fields
  checklistResults?: {
    taskId: string;
    status: 'OK' | 'NOK' | 'NA';
    notes: string;
  }[];
  images?: string[];
};

export type CompanyData = {
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
};

export type Product = {
  id: string;
  code?: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  category: 'LIMPEZA' | 'PISCINA' | 'GERAL';
};

export type SupplyItem = {
  id: string;
  name: string;
  category: 'LIMPEZA' | 'PISCINA';
  currentStock: number;
  minStock: number;
  unit: string;
  lastPrice?: number;
  clientId?: string;
};

export type SupplyQuotation = {
  id: string;
  date: string;
  items: {
    supplyItemId: string;
    quantity: number;
  }[];
  responses: {
    supplierId: string;
    prices: { [supplyItemId: string]: number };
    status: 'PENDING' | 'RECEIVED';
  }[];
  status: 'OPEN' | 'CLOSED';
};

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export type Payment = {
  id: string;
  clientId: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: PaymentStatus;
  reference: string;
};

export type LegalAgreement = {
  id: string;
  clientId: string;
  totalAmount: number;
  installments: number;
  remainingInstallments: number;
  status: 'ACTIVE' | 'COMPLETED' | 'BREACHED';
  startDate: string;
  notes?: string;
};

export type ScheduledMaintenance = {
  id: string;
  clientId: string;
  standardId: string;
  item: string;
  frequency: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  lastDone?: string;
  nextDate: string;
  status: 'PENDING' | 'DONE' | 'OVERDUE';
  category: string;
};

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  link?: string;
};

export type ConsumptionReading = {
  id: string;
  clientId: string;
  type: 'WATER' | 'GAS';
  previousValue: number;
  currentValue: number;
  consumption: number;
  date: string;
  unit: string;
  billed: boolean;
};

export type Vote = {
  id: string;
  userId: string;
  userName: string;
  optionId: string;
  timestamp: string;
  signature: string;
};

export type AssemblyOption = {
  id: string;
  text: string;
};

export type Assembly = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'UPCOMING' | 'ACTIVE' | 'CLOSED';
  options: AssemblyOption[];
  votes: Vote[];
  legalValidityHash: string;
};

export type DigitalFolderItem = {
  id: string;
  type: 'BALANCE_SHEET' | 'INVOICE' | 'TAX_DOC';
  title: string;
  date: string;
  amount?: number;
  fileUrl: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  signatures: {
    id: string;
    userName: string;
    role: string;
    date: string;
  }[];
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'MAINTENANCE' | 'EVENT' | 'GENERAL' | 'SECURITY';
  tower?: string;
  apartmentLine?: string;
  clientId: string;
};

export type Package = {
  id: string;
  residentName: string;
  apartment: string;
  tower: string;
  carrier: string;
  trackingCode?: string;
  receivedAt: string;
  pickedUpAt?: string;
  status: 'PENDING' | 'PICKED_UP';
  qrCode: string;
};

export type Visitor = {
  id: string;
  name: string;
  document?: string;
  type: 'VISITOR' | 'SERVICE_PROVIDER';
  apartment: string;
  tower: string;
  validUntil: string;
  qrCode: string;
  status: 'ACTIVE' | 'EXPIRED' | 'USED';
};

export type CriticalEvent = {
  id: string;
  device: string;
  location: string;
  type: 'PUMP' | 'DOOR' | 'FIRE' | 'ELECTRICAL';
  status: 'NORMAL' | 'ALERT' | 'CRITICAL';
  lastUpdate: string;
  description: string;
};

export type EnergyRecord = {
  month: string;
  consumption: number; // kWh
  solarGeneration: number; // kWh
  sensorSavings: number; // kWh (estimated savings from sensors)
  costWithoutTech: number; // R$
  actualCost: number; // R$
};

interface AppState {
  clients: Client[];
  checklistItems: ChecklistItem[];
  tickets: Ticket[];
  quotes: Quote[];
  receipts: Receipt[];
  costs: Cost[];
  appointments: Appointment[];
  products: Product[];
  suppliers: Supplier[];
  supplyItems: SupplyItem[];
  supplyQuotations: SupplyQuotation[];
  payments: Payment[];
  legalAgreements: LegalAgreement[];
  scheduledMaintenances: ScheduledMaintenance[];
  notifications: AppNotification[];
  consumptionReadings: ConsumptionReading[];
  digitalFolder: DigitalFolderItem[];
  assemblies: Assembly[];
  notices: Notice[];
  packages: Package[];
  visitors: Visitor[];
  criticalEvents: CriticalEvent[];
  energyData: EnergyRecord[];
  companyLogo: string | null;
  companySignature: string | null;
  companyData: CompanyData | null;
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  menuOrder: string[];
  isLoading: boolean;
  
  fetchInitialData: () => Promise<void>;
  setCompanyLogo: (logo: string | null) => void;
  setCompanySignature: (signature: string | null) => void;
  setCompanyData: (data: CompanyData) => void;
  setMenuOrder: (order: string[]) => void;
  toggleTheme: () => void;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, client: Omit<Client, 'id'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void;
  updateChecklistItem: (id: string, item: Omit<ChecklistItem, 'id'>) => void;
  deleteChecklistItem: (id: string) => void;
  
  addTicket: (ticket: Omit<Ticket, 'id'>) => void;
  updateTicket: (id: string, ticket: Omit<Ticket, 'id'>) => void;
  deleteTicket: (id: string) => void;

  addQuote: (quote: Omit<Quote, 'id'>) => void;
  updateQuote: (id: string, quote: Omit<Quote, 'id'>) => void;
  deleteQuote: (id: string) => void;

  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  deleteReceipt: (id: string) => void;

  addCost: (cost: Omit<Cost, 'id'>) => void;
  deleteCost: (id: string) => void;

  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Omit<Appointment, 'id'>) => void;
  deleteAppointment: (id: string) => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  importProducts: (products: Omit<Product, 'id'>[]) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Omit<Supplier, 'id'>) => void;
  deleteSupplier: (id: string) => void;

  addSupplyItem: (item: Omit<SupplyItem, 'id'>) => void;
  updateSupplyItem: (id: string, item: Omit<SupplyItem, 'id'>) => void;
  deleteSupplyItem: (id: string) => void;
  updateStock: (id: string, quantity: number) => void;

  createQuotation: (items: { supplyItemId: string; quantity: number }[]) => void;
  updateQuotationResponse: (quotationId: string, supplierId: string, prices: { [key: string]: number }) => void;
  
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  addLegalAgreement: (agreement: Omit<LegalAgreement, 'id'>) => void;
  updateLegalAgreement: (id: string, agreement: Partial<LegalAgreement>) => void;
  deleteLegalAgreement: (id: string) => void;

  addScheduledMaintenance: (maintenance: Omit<ScheduledMaintenance, 'id'>) => void;
  updateScheduledMaintenance: (id: string, maintenance: Partial<ScheduledMaintenance>) => void;
  deleteScheduledMaintenance: (id: string) => void;
  generateSchedulesForClient: (clientId: string) => void;
  
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  addConsumptionReading: (reading: Omit<ConsumptionReading, 'id'>) => void;
  addDigitalFolderItem: (item: Omit<DigitalFolderItem, 'id' | 'signatures' | 'status'>) => void;
  validateDigitalFolderItem: (id: string, userName: string, role: string) => void;
  addAssembly: (assembly: Omit<Assembly, 'id' | 'votes' | 'legalValidityHash'>) => void;
  castVote: (assemblyId: string, optionId: string, userName: string) => void;
  closeAssembly: (id: string) => void;

  addNotice: (notice: Omit<Notice, 'id' | 'date'>) => void;
  updateNotice: (id: string, notice: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;

  addPackage: (pkg: Omit<Package, 'id' | 'receivedAt' | 'status' | 'qrCode'>) => void;
  pickupPackage: (id: string) => void;
  
  addVisitor: (visitor: Omit<Visitor, 'id' | 'qrCode' | 'status'>) => void;
  revokeVisitor: (id: string) => void;

  updateCriticalEvent: (id: string, status: CriticalEvent['status'], description: string) => void;

  setEnergyData: (data: EnergyRecord[]) => void;

  restoreData: (data: Partial<AppState>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      clients: demoClients,
      checklistItems: demoChecklistItems,
      tickets: demoTickets,
      quotes: demoQuotes,
      receipts: demoReceipts,
      costs: demoCosts,
      appointments: demoAppointments,
      products: demoProducts,
      suppliers: [],
      supplyItems: [
        { id: uuidv4(), name: 'Cloro Granulado 10kg', category: 'PISCINA', currentStock: 5, minStock: 2, unit: 'Balde' },
        { id: uuidv4(), name: 'Algicida de Manutenção', category: 'PISCINA', currentStock: 3, minStock: 1, unit: 'Litro' },
        { id: uuidv4(), name: 'Detergente Neutro 5L', category: 'LIMPEZA', currentStock: 10, minStock: 4, unit: 'Galão' },
        { id: uuidv4(), name: 'Desinfetante 5L', category: 'LIMPEZA', currentStock: 8, minStock: 3, unit: 'Galão' },
      ],
      supplyQuotations: [],
      payments: demoPayments,
      legalAgreements: demoLegalAgreements,
      scheduledMaintenances: demoScheduledMaintenances,
      notifications: [],
      consumptionReadings: demoConsumptionReadings,
      digitalFolder: demoDigitalFolder,
      notices: demoNotices,
      packages: demoPackages,
      visitors: demoVisitors,
      criticalEvents: demoCriticalEvents,
      energyData: demoEnergyData,
      assemblies: demoAssemblies,
      companyLogo: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
      companySignature: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Signature_of_Robert_Mugabe.svg/1280px-Signature_of_Robert_Mugabe.svg.png',
      companyData: {
        name: 'FLORES MANUTENÇÃO PREDIAL LTDA',
        document: '00.123.456/0001-99',
        phone: '(11) 4002-8922',
        email: 'contato@floresmanutencao.com.br',
        address: 'Av. das Indústrias, 456 - Distrito Industrial, São Paulo - SP',
        website: 'www.floresmanutencao.com.br'
      },
      theme: 'light',
      isAuthenticated: false,
      menuOrder: ['dashboard', 'accountability', 'consumption', 'clients', 'products', 'supplies', 'tickets', 'kanban', 'quotes', 'receipts', 'financial', 'calendar', 'settings'],
      isLoading: false,
      
      fetchInitialData: async () => {
        set({ isLoading: true });
        try {
          // Apenas buscar do Supabase se não houver clientes (para não sobrescrever os dados de demonstração)
          if (get().clients.length === 0) {
            const { data: clientsData, error: clientsError } = await supabase.from('clients').select('*');
            
            if (!clientsError && clientsData) {
              const mappedClients: Client[] = clientsData.map(c => ({
                id: c.id,
                name: c.name,
                document: c.document,
                contactPerson: c.contact_person,
                phone: c.phone,
                email: c.email,
                address: c.address,
                notes: c.notes
              }));
              set({ clients: mappedClients });
            }
          }
        } catch (error) {
          console.error('Erro ao buscar dados iniciais:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      setCompanyLogo: (logo) => set({ companyLogo: logo }),
      setCompanySignature: (signature) => set({ companySignature: signature }),
      setCompanyData: (data) => set({ companyData: data }),
      setMenuOrder: (order) => set({ menuOrder: order }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      login: (user, pass) => {
        if (user === 'admin' && pass === '123') {
          set({ isAuthenticated: true });
          // Ao fazer login, busca os dados do Supabase
          get().fetchInitialData();
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
      
      addClient: async (client) => {
        const id = uuidv4();
        const newClient: Client = { ...client, id };

        // 1. Atualiza o estado local imediatamente (Optimistic Update)
        set((state) => ({ clients: [...state.clients, newClient] }));

        // 2. Tenta persistir no Supabase
        try {
          const dbClient = {
            name: client.name,
            document: client.document,
            contact_person: client.contactPerson,
            phone: client.phone,
            email: client.email,
            address: client.address,
            notes: client.notes
          };

          const { data, error } = await supabase.from('clients').insert([dbClient]).select().single();
          
          if (error) {
            console.warn('Erro ao persistir no Supabase, mantendo apenas local:', error);
            return;
          }

          // Se o Supabase retornou um ID diferente (ou o mesmo), atualizamos se necessário
          if (data && data.id !== id) {
            set((state) => ({
              clients: state.clients.map(c => c.id === id ? { ...newClient, id: data.id } : c)
            }));
          }
        } catch (error) {
          console.warn('Erro de conexão com Supabase, mantendo apenas local:', error);
        }
      },

      updateClient: async (id, updatedClient) => {
        // 1. Atualiza localmente
        set((state) => ({
          clients: state.clients.map(c => c.id === id ? { ...updatedClient, id } : c)
        }));

        // 2. Tenta persistir no Supabase
        try {
          const dbClient = {
            name: updatedClient.name,
            document: updatedClient.document,
            contact_person: updatedClient.contactPerson,
            phone: updatedClient.phone,
            email: updatedClient.email,
            address: updatedClient.address,
            notes: updatedClient.notes
          };

          const { error } = await supabase.from('clients').update(dbClient).eq('id', id);
          
          if (error) {
            console.warn('Erro ao atualizar no Supabase, mantendo apenas local:', error);
          }
        } catch (error) {
          console.warn('Erro de conexão com Supabase ao atualizar:', error);
        }
      },

      deleteClient: async (id) => {
        // 1. Remove localmente
        set((state) => ({ clients: state.clients.filter(c => c.id !== id) }));

        // 2. Tenta remover no Supabase
        try {
          const { error } = await supabase.from('clients').delete().eq('id', id);
          
          if (error) {
            console.warn('Erro ao deletar no Supabase, mantendo apenas local:', error);
          }
        } catch (error) {
          console.warn('Erro de conexão com Supabase ao deletar:', error);
        }
      },
      
      addChecklistItem: (item) => set((state) => ({ checklistItems: [...state.checklistItems, { ...item, id: uuidv4() }] })),
      updateChecklistItem: (id, updatedItem) => set((state) => ({
        checklistItems: state.checklistItems.map(i => i.id === id ? { ...updatedItem, id } : i)
      })),
      deleteChecklistItem: (id) => set((state) => ({ checklistItems: state.checklistItems.filter(i => i.id !== id) })),
      
      addTicket: (ticket) => set((state) => {
        let maxOs = 0;
        state.tickets.forEach(t => {
          if (t.osNumber && t.osNumber.startsWith('OS-')) {
            const num = parseInt(t.osNumber.replace('OS-', ''), 10);
            if (!isNaN(num) && num > maxOs) {
              maxOs = num;
            }
          }
        });
        const nextOsNumber = `OS-${String(maxOs + 1).padStart(4, '0')}`;
        return { tickets: [...state.tickets, { ...ticket, id: uuidv4(), osNumber: ticket.osNumber || nextOsNumber }] };
      }),
      updateTicket: (id, updatedTicket) => set((state) => ({
        tickets: state.tickets.map(t => t.id === id ? { ...updatedTicket, id } : t)
      })),
      deleteTicket: (id) => set((state) => ({ tickets: state.tickets.filter(t => t.id !== id) })),

      addQuote: (quote) => set((state) => ({ quotes: [...state.quotes, { ...quote, id: uuidv4() }] })),
      updateQuote: (id, updatedQuote) => set((state) => ({
        quotes: state.quotes.map(q => q.id === id ? { ...updatedQuote, id } : q)
      })),
      deleteQuote: (id) => set((state) => ({ quotes: state.quotes.filter(q => q.id !== id) })),

      addReceipt: (receipt) => set((state) => ({ receipts: [...state.receipts, { ...receipt, id: uuidv4() }] })),
      deleteReceipt: (id) => set((state) => ({ receipts: state.receipts.filter(r => r.id !== id) })),

      addCost: (cost) => set((state) => ({ costs: [...state.costs, { ...cost, id: uuidv4() }] })),
      deleteCost: (id) => set((state) => ({ costs: state.costs.filter(c => c.id !== id) })),

      addAppointment: (appointment) => set((state) => ({ appointments: [...state.appointments, { ...appointment, id: uuidv4() }] })),
      updateAppointment: (id, updatedAppointment) => set((state) => ({
        appointments: state.appointments.map(a => a.id === id ? { ...updatedAppointment, id } : a)
      })),
      deleteAppointment: (id) => set((state) => ({ appointments: state.appointments.filter(a => a.id !== id) })),

      addProduct: (product) => set((state) => ({ products: [...state.products, { ...product, id: uuidv4() }] })),
      updateProduct: (id, updatedProduct) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...updatedProduct, id } : p)
      })),
      deleteProduct: (id) => set((state) => ({ products: state.products.filter(p => p.id !== id) })),
      importProducts: (newProducts) => set((state) => ({ 
        products: [...state.products, ...newProducts.map(p => ({ ...p, id: uuidv4() }))]
      })),

      addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, { ...supplier, id: uuidv4() }] })),
      updateSupplier: (id, updated) => set((state) => ({
        suppliers: state.suppliers.map(s => s.id === id ? { ...updated, id } : s)
      })),
      deleteSupplier: (id) => set((state) => ({ suppliers: state.suppliers.filter(s => s.id !== id) })),

      addSupplyItem: (item) => set((state) => ({ supplyItems: [...state.supplyItems, { ...item, id: uuidv4() }] })),
      updateSupplyItem: (id, updated) => set((state) => ({
        supplyItems: state.supplyItems.map(i => i.id === id ? { ...updated, id } : i)
      })),
      deleteSupplyItem: (id) => set((state) => ({ supplyItems: state.supplyItems.filter(i => i.id !== id) })),
      updateStock: (id, quantity) => set((state) => ({
        supplyItems: state.supplyItems.map(i => i.id === id ? { ...i, currentStock: i.currentStock + quantity } : i)
      })),

      createQuotation: (items) => set((state) => {
        const id = uuidv4();
        const relevantSuppliers = state.suppliers.filter(s => 
          items.some(qi => {
            const supplyItem = state.supplyItems.find(si => si.id === qi.supplyItemId);
            return supplyItem?.category === s.category || s.category === 'GERAL';
          })
        );

        const newQuotation: SupplyQuotation = {
          id,
          date: new Date().toISOString(),
          items,
          responses: relevantSuppliers.map(s => ({
            supplierId: s.id,
            prices: {},
            status: 'PENDING'
          })),
          status: 'OPEN'
        };

        return { supplyQuotations: [...state.supplyQuotations, newQuotation] };
      }),

      updateQuotationResponse: (quotationId, supplierId, prices) => set((state) => ({
        supplyQuotations: state.supplyQuotations.map(q => {
          if (q.id !== quotationId) return q;
          return {
            ...q,
            responses: q.responses.map(r => 
              r.supplierId === supplierId ? { ...r, prices, status: 'RECEIVED' } : r
            )
          };
        })
      })),

      addPayment: (payment) => set((state) => ({ payments: [...state.payments, { ...payment, id: uuidv4() }] })),
      updatePayment: (id, updated) => set((state) => ({
        payments: state.payments.map(p => p.id === id ? { ...p, ...updated } : p)
      })),
      deletePayment: (id) => set((state) => ({ payments: state.payments.filter(p => p.id !== id) })),

      addLegalAgreement: (agreement) => set((state) => ({ legalAgreements: [...state.legalAgreements, { ...agreement, id: uuidv4() }] })),
      updateLegalAgreement: (id, updated) => set((state) => ({
        legalAgreements: state.legalAgreements.map(a => a.id === id ? { ...a, ...updated } : a)
      })),
      deleteLegalAgreement: (id) => set((state) => ({ legalAgreements: state.legalAgreements.filter(a => a.id !== id) })),
      
      addScheduledMaintenance: (maintenance) => set((state) => ({
        scheduledMaintenances: [...state.scheduledMaintenances, { ...maintenance, id: uuidv4() }]
      })),
      updateScheduledMaintenance: (id, updated) => set((state) => ({
        scheduledMaintenances: state.scheduledMaintenances.map(m => m.id === id ? { ...m, ...updated } : m)
      })),
      deleteScheduledMaintenance: (id) => set((state) => ({
        scheduledMaintenances: state.scheduledMaintenances.filter(m => m.id !== id)
      })),
      generateSchedulesForClient: (clientId) => {
        const newSchedules: ScheduledMaintenance[] = NBR5674_STANDARDS.map((std: any) => {
          const nextDate = new Date();
          if (std.frequency === 'Mensal') nextDate.setMonth(nextDate.getMonth() + 1);
          else if (std.frequency === 'Trimestral') nextDate.setMonth(nextDate.getMonth() + 3);
          else if (std.frequency === 'Semestral') nextDate.setMonth(nextDate.getMonth() + 6);
          else nextDate.setFullYear(nextDate.getFullYear() + 1);

          return {
            id: uuidv4(),
            clientId,
            standardId: std.id,
            item: std.item,
            frequency: std.frequency,
            nextDate: nextDate.toISOString().split('T')[0],
            status: 'PENDING',
            category: std.category
          };
        });

        set((state) => ({
          scheduledMaintenances: [
            ...state.scheduledMaintenances.filter(m => m.clientId !== clientId),
            ...newSchedules
          ]
        }));
      },

      addNotification: (notif) => set((state) => ({
        notifications: [
          { ...notif, id: uuidv4(), date: new Date().toISOString(), read: false },
          ...state.notifications
        ].slice(0, 50) // Keep last 50
      })),
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      clearNotifications: () => set({ notifications: [] }),

      addConsumptionReading: (reading) => set((state) => ({
        consumptionReadings: [...state.consumptionReadings, { ...reading, id: uuidv4() }]
      })),
      addDigitalFolderItem: (item) => set((state) => ({
        digitalFolder: [...state.digitalFolder, { ...item, id: uuidv4(), status: 'PENDING', signatures: [] }]
      })),
      validateDigitalFolderItem: (id, userName, role) => set((state) => ({
        digitalFolder: state.digitalFolder.map(item => {
          if (item.id !== id) return item;
          const newSignature = { id: uuidv4(), userName, role, date: new Date().toISOString() };
          const newSignatures = [...item.signatures, newSignature];
          const newStatus = newSignatures.length >= 3 ? 'VALIDATED' : item.status;
          return { ...item, signatures: newSignatures, status: newStatus };
        })
      })),

      addAssembly: (assembly) => set((state) => ({
        assemblies: [
          ...state.assemblies,
          {
            ...assembly,
            id: uuidv4(),
            votes: [],
            legalValidityHash: `SHA256-${uuidv4().substring(0, 8).toUpperCase()}`
          }
        ]
      })),

      castVote: (assemblyId, optionId, userName) => set((state) => ({
        assemblies: state.assemblies.map(a => {
          if (a.id !== assemblyId) return a;
          const vote: Vote = {
            id: uuidv4(),
            userId: 'current-user', // In a real app, this would be the logged in user's ID
            userName,
            optionId,
            timestamp: new Date().toISOString(),
            signature: `SIG-${uuidv4().substring(0, 12).toUpperCase()}`
          };
          return { ...a, votes: [...a.votes, vote] };
        })
      })),

      closeAssembly: (id) => set((state) => ({
        assemblies: state.assemblies.map(a => a.id === id ? { ...a, status: 'CLOSED' } : a)
      })),

      addNotice: (notice) => set((state) => ({
        notices: [
          { ...notice, id: uuidv4(), date: new Date().toISOString() },
          ...state.notices
        ]
      })),

      updateNotice: (id, updated) => set((state) => ({
        notices: state.notices.map(n => n.id === id ? { ...n, ...updated } : n)
      })),

      deleteNotice: (id) => set((state) => ({
        notices: state.notices.filter(n => n.id !== id)
      })),

      addPackage: (pkg) => set((state) => {
        const id = uuidv4();
        const newPkg: Package = {
          ...pkg,
          id,
          receivedAt: new Date().toISOString(),
          status: 'PENDING',
          qrCode: `PKG-${id}`
        };
        
        // Auto-notify logic would go here
        state.addNotification({
          title: 'Nova Encomenda!',
          message: `Pacote de ${pkg.carrier} para ${pkg.residentName} (${pkg.apartment} ${pkg.tower})`,
          type: 'SUCCESS'
        });

        return { packages: [newPkg, ...state.packages] };
      }),

      pickupPackage: (id) => set((state) => ({
        packages: state.packages.map(p => 
          p.id === id ? { ...p, status: 'PICKED_UP', pickedUpAt: new Date().toISOString() } : p
        )
      })),

      addVisitor: (visitor) => set((state) => {
        const id = uuidv4();
        const newVisitor: Visitor = {
          ...visitor,
          id,
          qrCode: `VIS-${id}`,
          status: 'ACTIVE'
        };
        return { visitors: [newVisitor, ...state.visitors] };
      }),

      revokeVisitor: (id) => set((state) => ({
        visitors: state.visitors.map(v => v.id === id ? { ...v, status: 'EXPIRED' } : v)
      })),

      updateCriticalEvent: (id, status, description) => set((state) => {
        const updatedEvents = state.criticalEvents.map(e => 
          e.id === id ? { ...e, status, description, lastUpdate: new Date().toISOString() } : e
        );

        if (status === 'CRITICAL') {
          const event = updatedEvents.find(e => e.id === id);
          state.addNotification({
            title: 'ALERTA CRÍTICO!',
            message: `${event?.device}: ${description}`,
            type: 'ERROR'
          });
        }

        return { criticalEvents: updatedEvents };
      }),

      setEnergyData: (energyData) => set({ energyData }),

      restoreData: (data) => set((state) => ({
        ...state,
        ...data,
        // Ensure we don't accidentally overwrite functions if they were included in JSON
        clients: data.clients || state.clients,
        checklistItems: data.checklistItems || state.checklistItems,
        tickets: data.tickets || state.tickets,
        quotes: data.quotes || state.quotes,
        receipts: data.receipts || state.receipts,
        costs: data.costs || state.costs,
        appointments: data.appointments || state.appointments,
        products: data.products || state.products,
        companyLogo: data.companyLogo !== undefined ? data.companyLogo : state.companyLogo,
        companySignature: data.companySignature !== undefined ? data.companySignature : state.companySignature,
        companyData: data.companyData !== undefined ? data.companyData : state.companyData,
        theme: data.theme || state.theme,
        menuOrder: data.menuOrder || state.menuOrder,
      })),
    }),
    {
      name: 'manutencao-storage',
    }
  )
);
