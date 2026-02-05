
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
  createdAt: string;
};

export type AppState = {
  clients: Client[];
  services: Service[];
  deals: Deal[];
  invoices: Invoice[];
};
