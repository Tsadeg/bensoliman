import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { TrendingUp, TrendingDown, DollarSign, Activity, FileText, Download } from 'lucide-react'
import { Button } from '../ui/Button'
import { InvoiceGenerator } from '../invoice/InvoiceGenerator'

interface Transaction {
  id: string
  type: 'exit' | 'sell_to' | 'buy' | 'entry'
  created_at: string
  amount: number
  country_city: string
  paper_category: string
  price: number
  currency: string
  name?: string
  from_account?: string
  to_account?: string
  deliver_to?: string
  notes?: string
}

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
}

const typeConfig = {
  exit: {
    label: 'خروج',
    icon: TrendingDown,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  sell_to: {
    label: 'بيع الى',
    icon: DollarSign,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  buy: {
    label: 'شراء من',
    icon: TrendingUp,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  entry: {
    label: 'دخول',
    icon: Activity,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showInvoice, setShowInvoice] = useState(false)

  const handleGenerateInvoice = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowInvoice(true)
  }

  const handleCloseInvoice = () => {
    setShowInvoice(false)
    setSelectedTransaction(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="animate-pulse"
          >
            <div className="bg-gray-200 rounded-xl h-20"></div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <DollarSign className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد معاملات</h3>
        <p className="text-gray-500">ابدأ بإضافة معاملة جديدة</p>
      </motion.div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {transactions.map((transaction, index) => {
          const config = typeConfig[transaction.type]
          const Icon = config.icon
          
          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                p-6 rounded-xl border-2 ${config.borderColor} ${config.bgColor}
                hover:shadow-lg transition-all duration-200
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 rtl:space-x-reverse flex-1">
                  <div className={`
                    p-3 rounded-xl ${config.bgColor} border ${config.borderColor}
                  `}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <h3 className="font-semibold text-gray-900 text-lg">{config.label}</h3>
                        <span className="text-sm text-gray-500">
                          {format(new Date(transaction.created_at), 'PPp', { locale: ar })}
                        </span>
                      </div>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={FileText}
                          onClick={() => handleGenerateInvoice(transaction)}
                          className="text-xs"
                        >
                          إنشاء إيصال
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <span className="text-gray-500 block mb-1">المبلغ:</span>
                        <p className="font-semibold text-lg">
                          {transaction.amount.toLocaleString()} {transaction.currency}
                        </p>
                      </div>
                      
                      <div className="bg-white/50 p-3 rounded-lg">
                        <span className="text-gray-500 block mb-1">البلد/المدينة:</span>
                        <p className="font-medium">{transaction.country_city}</p>
                      </div>
                      
                      <div className="bg-white/50 p-3 rounded-lg">
                        <span className="text-gray-500 block mb-1">الفئة الورقية:</span>
                        <p className="font-medium">{transaction.paper_category}</p>
                      </div>
                      
                      <div className="bg-white/50 p-3 rounded-lg">
                        <span className="text-gray-500 block mb-1">السعر:</span>
                        <p className="font-semibold text-lg">
                          {transaction.price.toLocaleString()} {transaction.currency}
                        </p>
                      </div>
                    </div>

                    {/* Additional fields based on transaction type */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                      {transaction.name && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <span className="text-gray-500 block mb-1">الاسم:</span>
                          <p className="font-medium">{transaction.name}</p>
                        </div>
                      )}
                      
                      {transaction.from_account && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <span className="text-gray-500 block mb-1">من حساب:</span>
                          <p className="font-medium">{transaction.from_account}</p>
                        </div>
                      )}
                      
                      {transaction.to_account && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <span className="text-gray-500 block mb-1">في حساب:</span>
                          <p className="font-medium">{transaction.to_account}</p>
                        </div>
                      )}
                      
                      {transaction.deliver_to && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <span className="text-gray-500 block mb-1">
                            {transaction.type === 'entry' ? 'استلام من:' : 'تسليم إلى:'}
                          </span>
                          <p className="font-medium">{transaction.deliver_to}</p>
                        </div>
                      )}
                    </div>
                    
                    {transaction.notes && (
                      <div className="mt-4 p-4 bg-white/70 rounded-lg border border-gray-200">
                        <span className="text-gray-500 text-sm block mb-2">ملاحظة:</span>
                        <p className="text-sm text-gray-700 leading-relaxed">{transaction.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Invoice Generator Modal */}
      {selectedTransaction && (
        <InvoiceGenerator
          transaction={selectedTransaction}
          isOpen={showInvoice}
          onClose={handleCloseInvoice}
        />
      )}
    </>
  )
}