import { useState, useEffect } from 'react'
import { supabase, Database } from '../lib/supabase'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchTransactions = async () => {
      console.log('Fetching transactions for user:', userId)
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching transactions:', error)
      } else {
        console.log('Fetched transactions:', data)
        setTransactions(data || [])
      }
      setLoading(false)
    }

    fetchTransactions()

    // Set up real-time subscription with better error handling
    const subscription = supabase
      .channel(`transactions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newTransaction = payload.new as Transaction
            console.log('Adding new transaction:', newTransaction)
            setTransactions((prev) => {
              // Check if transaction already exists to avoid duplicates
              const exists = prev.some(t => t.id === newTransaction.id)
              if (exists) {
                console.log('Transaction already exists, skipping')
                return prev
              }
              return [newTransaction, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedTransaction = payload.new as Transaction
            console.log('Updating transaction:', updatedTransaction)
            setTransactions((prev) =>
              prev.map((t) =>
                t.id === updatedTransaction.id ? updatedTransaction : t
              )
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            console.log('Deleting transaction:', deletedId)
            setTransactions((prev) =>
              prev.filter((t) => t.id !== deletedId)
            )
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      console.log('Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [userId])

  const addTransaction = async (transaction: Omit<TransactionInsert, 'user_id'>) => {
    if (!userId) return { error: new Error('User not authenticated') }

    console.log('Adding transaction:', transaction)

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...transaction, user_id: userId })
      .select()

    if (error) {
      console.error('Error adding transaction:', error)
    } else {
      console.log('Transaction added successfully:', data)
      // Force refresh the transactions list
      const { data: refreshedData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (refreshedData) {
        setTransactions(refreshedData)
      }
    }

    return { data, error }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()

    return { data, error }
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    return { error }
  }

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}