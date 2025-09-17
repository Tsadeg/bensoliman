import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'exit' | 'sell_to' | 'buy' | 'entry'
          created_at: string
          from_account?: string
          to_account?: string
          name?: string
          amount: number
          country_city: string
          deliver_to?: string
          paper_category: string
          price: number
          notes?: string
          currency: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'exit' | 'sell_to' | 'buy' | 'entry'
          created_at?: string
          from_account?: string
          to_account?: string
          name?: string
          amount: number
          country_city: string
          deliver_to?: string
          paper_category: string
          price: number
          notes?: string
          currency: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'exit' | 'sell_to' | 'buy' | 'entry'
          created_at?: string
          from_account?: string
          to_account?: string
          name?: string
          amount?: number
          country_city?: string
          deliver_to?: string
          paper_category?: string
          price?: number
          notes?: string
          currency?: string
        }
      }
    }
  }
}