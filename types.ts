
export type Client = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  companyName?: string;
  observations: string;
  createdAt: string;
};

export type Service = {
  id: string;
  name: string;
  baseValue: number;
  type: 'UNIQUE' | 'MONTHLY';
  observations: string;
};

export type Stage = 'NEW_CONTACT' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'CLOSED' | 'LOST';

export type Deal = {
  id: string;
  clientId: string;
  serviceId: string;
  value: number;
  stage: Stage;
  temperature?: 'HOT' | 'WARM' | 'COLD';
  details?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'EXPIRED';
  createdAt: string;
};

export type Invoice = {
  id: string;
  clientId: string;
  serviceId: string;
  value: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  pixCode?: string;
  invoiceNumber?: string;
  dealId?: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  userId?: string;
  category: string;
  description?: string;
  value: number;
  date: string;
  createdAt: string;
};

export type AppState = {
  clients: Client[];
  services: Service[];
  deals: Deal[];
  invoices: Invoice[];
  expenses: Expense[];
  plan?: 'FREE' | 'PRO' | 'BUSINESS';
};

export type PlanType = 'FREE' | 'PRO' | 'BUSINESS';

export type Subscription = {
  userId: string;
  plan: PlanType;
  createdAt: string;
};

export type UsageTracking = {
  id: string;
  userId: string;
  monthYear: string;
  proposalsCreated: number;
  createdAt: string;
};
