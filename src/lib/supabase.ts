import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  category: string;
  instructor: string;
  created_at: string;
};
