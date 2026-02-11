import { createClient } from '@supabase/supabase-client';

// Use exatamente import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Este log vai nos ajudar a debugar no navegador depois
console.log("Tentando conectar ao Supabase URL:", supabaseUrl ? "OK" : "VAZIO");

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('As variáveis de ambiente do Supabase não foram encontradas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);