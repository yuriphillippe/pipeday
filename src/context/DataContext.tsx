
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Client, Service, Deal, Invoice } from '../../types';
import { useAuth } from './AuthContext';

type DataContextType = {
    clients: Client[];
    services: Service[];
    deals: Deal[];
    invoices: Invoice[];
    loading: boolean;
    refreshData: () => Promise<void>;
    addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<any>;
    addService: (service: Omit<Service, 'id'>) => Promise<any>;
    addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => Promise<any>;
    addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<any>;
    updateClient: (id: string, updates: Partial<Client>) => Promise<any>;
    // Add other update methods as needed, following the pattern
    deleteClient: (id: string) => Promise<any>;
    updateDeal: (id: string, updates: Partial<Deal>) => Promise<any>;
    updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<any>;
    deleteInvoice: (id: string) => Promise<any>;
    updateService: (id: string, updates: Partial<Service>) => Promise<any>;
    deleteService: (id: string) => Promise<any>;
    deleteDeal: (id: string) => Promise<any>;
    userProfile: { name: string; email: string; pixKey: string };
    updateUserProfile: (profile: { name: string; email: string; pixKey: string }) => void;
};

const DataContext = createContext<DataContextType>({
    clients: [],
    services: [],
    deals: [],
    invoices: [],
    loading: true,
    refreshData: async () => { },
    addClient: async () => { },
    addService: async () => { },
    addDeal: async () => { },
    addInvoice: async () => { },
    updateClient: async () => { },
    deleteClient: async () => { },
    updateDeal: async () => { },
    updateInvoice: async () => { },
    deleteInvoice: async () => { },
    updateService: async () => { },
    deleteService: async () => { },
    deleteDeal: async () => { },
    userProfile: { name: 'Admin', email: '', pixKey: '' },
    updateUserProfile: () => { },
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);

    // Helper to map DB snake_case to local camelCase
    const mapClient = (data: any): Client => ({
        id: data.id,
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        companyName: data.company_name,
        observations: data.observations,
        createdAt: data.created_at,
    });

    const mapService = (data: any): Service => ({
        id: data.id,
        name: data.name,
        baseValue: data.base_value,
        type: data.type,
        observations: data.observations,
    });

    const mapDeal = (data: any): Deal => ({
        id: data.id,
        clientId: data.client_id,
        serviceId: data.service_id,
        value: data.value,
        stage: data.stage,
        temperature: data.temperature,
        details: data.details,
        paymentStatus: data.payment_status,
        createdAt: data.created_at,
    });

    const mapInvoice = (data: any): Invoice => ({
        id: data.id,
        clientId: data.client_id,
        serviceId: data.service_id,
        value: data.value,
        dueDate: data.due_date,
        status: data.status,
        pixCode: data.pix_code,
        createdAt: data.created_at,
    });

    const refreshData = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const [clientsRes, servicesRes, dealsRes, invoicesRes] = await Promise.all([
            supabase.from('clients').select('*').order('created_at', { ascending: false }),
            supabase.from('services').select('*').order('name', { ascending: true }),
            supabase.from('deals').select('*').order('created_at', { ascending: false }),
            supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        ]);

        if (clientsRes.data) setClients(clientsRes.data.map(mapClient));
        if (servicesRes.data) setServices(servicesRes.data.map(mapService));
        if (dealsRes.data) setDeals(dealsRes.data.map(mapDeal));
        if (invoicesRes.data) setInvoices(invoicesRes.data.map(mapInvoice));

        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            refreshData();
        } else {
            setClients([]);
            setServices([]);
            setDeals([]);
            setInvoices([]);
        }
    }, [user, refreshData]);

    // Mutations
    const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
        const { error } = await supabase.from('clients').insert([{
            name: client.name,
            email: client.email,
            whatsapp: client.whatsapp,
            company_name: client.companyName,
            observations: client.observations,
        }]);
        if (error) throw error;
        await refreshData();
    };

    const updateClient = async (id: string, updates: Partial<Client>) => {
        // Only map what's present
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.whatsapp) dbUpdates.whatsapp = updates.whatsapp;
        if (updates.companyName) dbUpdates.company_name = updates.companyName;
        if (updates.observations) dbUpdates.observations = updates.observations;

        const { error } = await supabase.from('clients').update(dbUpdates).eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const deleteClient = async (id: string) => {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const addService = async (service: Omit<Service, 'id'>) => {
        const { error } = await supabase.from('services').insert([{
            name: service.name,
            base_value: service.baseValue,
            type: service.type,
            observations: service.observations
        }]);
        if (error) throw error;
        await refreshData();
    };

    const addDeal = async (deal: Omit<Deal, 'id' | 'createdAt'>) => {
        const { error } = await supabase.from('deals').insert([{
            client_id: deal.clientId,
            service_id: deal.serviceId,
            value: deal.value,
            stage: deal.stage,
            payment_status: deal.paymentStatus,
            temperature: deal.temperature,
            details: deal.details
        }]);
        if (error) throw error;
        await refreshData();
    };

    const updateDeal = async (id: string, updates: Partial<Deal>) => {
        const dbUpdates: any = {};
        if (updates.clientId) dbUpdates.client_id = updates.clientId;
        if (updates.serviceId) dbUpdates.service_id = updates.serviceId;
        if (updates.value) dbUpdates.value = updates.value;
        if (updates.stage) dbUpdates.stage = updates.stage;
        if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
        if (updates.temperature) dbUpdates.temperature = updates.temperature;
        if (updates.details) dbUpdates.details = updates.details;

        const { error } = await supabase.from('deals').update(dbUpdates).eq('id', id);
        if (error) throw error;
        await refreshData();
    }


    const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
        const { error } = await supabase.from('invoices').insert([{
            client_id: invoice.clientId,
            service_id: invoice.serviceId,
            value: invoice.value,
            due_date: invoice.dueDate,
            status: invoice.status,
            pix_code: invoice.pixCode
        }]);
        if (error) throw error;
        await refreshData();
    };

    const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        // Add others if needed
        const { error } = await supabase.from('invoices').update(dbUpdates).eq('id', id);
        if (error) throw error;
        await refreshData();
    };


    const deleteDeal = async (id: string) => {
        const { error } = await supabase.from('deals').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const updateService = async (id: string, updates: Partial<Service>) => {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.baseValue) dbUpdates.base_value = updates.baseValue;
        if (updates.type) dbUpdates.type = updates.type;
        if (updates.observations) dbUpdates.observations = updates.observations;

        const { error } = await supabase.from('services').update(dbUpdates).eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const deleteService = async (id: string) => {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const deleteInvoice = async (id: string) => {
        const { error } = await supabase.from('invoices').delete().eq('id', id);
        if (error) throw error;
        await refreshData();
    };

    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem('settings_profile');
        return saved ? JSON.parse(saved) : { name: 'Admin', email: 'admin@pipeday.com', pixKey: '' };
    });

    const updateUserProfile = (profile: { name: string; email: string; pixKey: string }) => {
        setUserProfile(profile);
        localStorage.setItem('settings_profile', JSON.stringify(profile));
    };

    return (
        <DataContext.Provider value={{
            clients, services, deals, invoices, loading, refreshData,
            addClient, updateClient, deleteClient,
            addService, updateService, deleteService,
            addDeal, updateDeal, deleteDeal,
            addInvoice, updateInvoice, deleteInvoice,
            userProfile, updateUserProfile
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
