import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight, ArrowDownLeft, ArrowUpLeft } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { TransactionForm } from '../transactions/TransactionForm'
import { TransactionList } from '../transactions/TransactionList'
import { useTransactions } from '../../hooks/useTransactions'
import { useAuth } from '../../hooks/useAuth'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { transactions, loading, addTransaction } = useTransactions(user?.id)
  const [showForm, setShowForm] = useState(false)
  const [selectedType, setSelectedType] = useState<'exit' | 'sell_to' | 'buy' | 'entry'>('exit')
  const [selectedDate, setSelectedDate] = useState<string>('')

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const filteredTransactions = selectedDate 
    ? transactions.filter(t => {
        const transactionDate = new Date(t.created_at).toISOString().split('T')[0]
        return transactionDate === selectedDate
      })
    : transactions

  console.log('All transactions:', transactions)
  console.log('Filtered transactions:', filteredTransactions)
  console.log('Selected date:', selectedDate)

  const stats = {
    total: filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    exits: filteredTransactions.filter(t => t.type === 'exit').length,
    sales: filteredTransactions.filter(t => t.type === 'sell_to').length,
    purchases: filteredTransactions.filter(t => t.type === 'buy').length,
    entries: filteredTransactions.filter(t => t.type === 'entry').length,
  }

  const transactionTypes = [
    { key: 'exit' as const, label: 'خروج', icon: ArrowUpRight, color: 'text-red-500' },
    { key: 'sell_to' as const, label: 'بيع الي', icon: ArrowDownLeft, color: 'text-blue-500' },
    { key: 'buy' as const, label: 'شراء', icon: ArrowUpLeft, color: 'text-green-500' },
    { key: 'entry' as const, label: 'دخول', icon: Activity, color: 'text-purple-500' },
  ]

  const handleAddTransaction = async (data: any) => {
    console.log('Dashboard: Adding transaction with data:', data)
    
    const { error } = await addTransaction({
      type: selectedType,
      ...data
    })
    
    if (!error) {
      console.log('Dashboard: Transaction added successfully')
      setShowForm(false)
    } else {
      console.error('Dashboard: Error adding transaction:', error)
    }
    
    return { error }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">$</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">نظام المعاملات المالية</h1>
                <p className="text-gray-600">مرحباً، {user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {transactionTypes.map((type) => (
            <Card key={type.key} className="p-6" hover>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <type.icon className={`h-8 w-8 ${type.color}`} />
                </div>
                <div className="ml-4 rtl:ml-0 rtl:mr-4">
                  <p className="text-sm font-medium text-gray-500">{type.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats[type.key === 'sell_to' ? 'sales' : type.key === 'buy' ? 'purchases' : type.key === 'entry' ? 'entries' : 'exits']}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">إضافة معاملة جديدة</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">فلترة بالتاريخ:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate('')}
                  >
                    مسح الفلتر
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {transactionTypes.map((type) => (
                  <Button
                    key={type.key}
                    variant="outline"
                    icon={type.icon}
                    onClick={() => {
                      setSelectedType(type.key)
                      setShowForm(true)
                    }}
                    className="justify-start"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                المعاملات {selectedDate ? `لتاريخ ${selectedDate}` : 'الأخيرة'}
                <span className="text-sm text-gray-500 mr-2">({filteredTransactions.length})</span>
              </h2>
              <Button
                icon={Plus}
                onClick={() => setShowForm(true)}
              >
                إضافة معاملة
              </Button>
            </div>
            <TransactionList transactions={filteredTransactions} loading={loading} />
          </Card>
        </motion.div>
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddTransaction}
        type={selectedType}
      />
    </div>
  )
}