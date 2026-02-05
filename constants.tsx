
import { Client, Service, Deal, Stage, Invoice } from './types';

export const STAGES: { id: Stage; label: string; color: string }[] = [
  { id: 'NEW_CONTACT', label: 'Novo Contato', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'PROPOSAL_SENT', label: 'Proposta Enviada', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'NEGOTIATION', label: 'Em Negociação', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'CLOSED', label: 'Fechado', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'LOST', label: 'Perdido', color: 'bg-red-100 text-red-700 border-red-200' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'João Silva', email: 'joao@tech.com', whatsapp: '11999999999', observations: 'Cliente VIP', createdAt: '2023-10-01' },
  { id: '2', name: 'Maria Souza', email: 'maria@design.co', whatsapp: '21988888888', observations: 'Interesse em branding', createdAt: '2023-10-05' },
  { id: '3', name: 'Pedro Santos', email: 'pedro@marketing.com', whatsapp: '31977777777', observations: 'Indicação do Carlos', createdAt: '2023-10-10' },
];

export const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'Consultoria Estratégica', baseValue: 1500, type: 'UNIQUE', observations: '2 reuniões de 1h' },
  { id: '2', name: 'Gestão de Tráfego', baseValue: 2500, type: 'MONTHLY', observations: 'Setup incluso' },
  { id: '3', name: 'Criação de Website', baseValue: 5000, type: 'UNIQUE', observations: 'Landing page simples' },
];

export const MOCK_DEALS: Deal[] = [
  { id: 'd1', clientId: '1', serviceId: '1', value: 1500, stage: 'NEW_CONTACT', paymentStatus: 'PENDING', createdAt: '2023-10-12' },
  { id: 'd2', clientId: '2', serviceId: '3', value: 4500, stage: 'PROPOSAL_SENT', paymentStatus: 'PENDING', createdAt: '2023-10-15' },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv1', clientId: '1', serviceId: '1', value: 1500, dueDate: '2023-11-20', status: 'PAID', createdAt: '2023-11-01' },
  { id: 'inv2', clientId: '2', serviceId: '3', value: 4500, dueDate: '2023-12-05', status: 'PENDING', createdAt: '2023-11-05' },
];
