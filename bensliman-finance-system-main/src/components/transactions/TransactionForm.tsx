import { useForm } from 'react-hook-form'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  type: 'exit' | 'sell_to' | 'buy' | 'entry'
  onSubmit: (data: any) => Promise<{ error: any }>
}

interface FormData {
  amount: string
  country_city: string
  paper_category?: string
  price: string
  currency: string
  notes?: string
  name?: string
  from_account?: string
  to_account?: string
  deliver_to?: string
}

const typeLabels = {
  exit: 'خروج',
  sell_to: 'بيع الى',
  buy: 'شراء من',
  entry: 'دخول'
}

const currencyOptions = [
  'دينار الليبي',
  'دينار التونسي', 
  'دينار ليبي فئة (20-5)',
  'جني المصري',
  'ريممبي الصين',
  'دولار',
  'يورو',
  'جنى الاسترليني',
  'غرام ذهب',
  'غرام فضة',
]

export function TransactionForm({ isOpen, onClose, type, onSubmit }: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      amount: '',
      price: '',
      country_city: '',
      paper_category: 'tt',
      currency: 'دولار',
      notes: '',
      name: '',
      from_account: '',
      to_account: '',
      deliver_to: ''
    }
  })

  const handleFormSubmit = async (data: FormData) => {
    try {

      console.log("TransactionForm rendered");
      console.log('Raw form data:', data)
      
      // Convert string numbers to actual numbers, handling decimals properly
      const amount = data.amount ? parseFloat(data.amount.toString()) : 0
      const price = data.price ? parseFloat(data.price.toString()) : 0
      
      // console.log('Parsed numbers:', { amount, price })
      
      
      // if (isNaN(price) || price <= 0) {
      //   console.error('Invalid price:', data.price)
      //   return
      // }
      
      const formData = {
        amount,
        price,
        country_city: data.country_city?.trim() || '',
        paper_category: data.paper_category?.trim() || 'غير محدد',
        currency: data.currency || 'دولار',
        notes: data.notes?.trim() || '',
        name: data.name?.trim() || '',
        from_account: data.from_account?.trim() || '',
        to_account: data.to_account?.trim() || '',
        deliver_to: data.deliver_to?.trim() || '',
        type,
        created_at: new Date().toISOString()
      }
      
      console.log('Final form data to submit:', formData)
      
      const { error } = await onSubmit(formData)
      console.log('onSubmit response:', { error })
      
      if (!error) {
        console.log('Transaction added successfully')
        reset()
        onClose()
      } else {
        console.error('Error adding transaction:', error)
        alert('حدث خطأ أثناء إضافة المعاملة: ' + (error.message || 'خطأ غير معروف'))
      }
    } catch (err) {
      console.error('Unexpected error during submission:', err)
      alert('حدث خطأ غير متوقع')
    }
  }
  
  const handleClose = () => {
    console.log('Form closed')
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`إضافة معاملة ${typeLabels[type]}`}
    >
      <form 
        onSubmit={handleSubmit(handleFormSubmit)} 
        className="space-y-6"
      >
        {(type === 'sell_to' || type === 'buy') && (
          <Input
            label="الأسم"
            {...register('name', { 
              // required: 'الأسم مطلوب'
            })}
            error={errors.name?.message}
          />
        )}

        {type === 'exit' && (
          <Input
            label="من حساب"
            {...register('from_account', { 
              // required: 'الحساب مطلوب'
            })}
            error={errors.from_account?.message}
          />
        )}

        {type === 'entry' && (
          <Input
            label="في حساب"
            {...register('to_account', { 
              // required: 'الحساب مطلوب'
            })}
            error={errors.to_account?.message}
          />
        )}

        {(type === 'exit' || type === 'entry') && (
          <Input
            label={type === 'entry' ? ' استلمت من' : 'تسليم الى'}
            {...register('deliver_to', { 
              // required: 'هذا الحقل مطلوب'
            })}
            error={errors.deliver_to?.message}
          />
        )}

        {(type === 'sell_to' || type === 'buy' || type === 'entry' || type === 'exit')  && (
          <Input
            label="المبلغ"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            {...register('amount', {
              // required: 'المبلغ مطلوب',
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: 'يرجى إدخال رقم صحيح (مثال: 10.50)'
              }
            })}
            error={errors.amount?.message}
          />
        )}

        <Input
          label="البلد/المدينة"
          {...register('country_city', { 
            // required: 'البلد/المدينة مطلوب'
          })}
          error={errors.country_city?.message}
        />

        {/* Removed paper_category input, but it is still included in form data as default: '' */}

        {(type === 'sell_to' || type === 'buy') && (
        <Input
          label="السعر"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...register('price', {
            // required: 'السعر مطلوب',
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: 'يرجى إدخال رقم صحيح (مثال: 10.50)'
            }
          })}
          error={errors.price?.message}
        />
        )}

        {/* Currency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            العملة
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200"
            {...register('currency', { required: 'العملة مطلوبة' })}
          >
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          {errors.currency && (
            <p className="text-sm text-red-600 mt-1">{errors.currency.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ملاحظة (اختياري)
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 placeholder-gray-400 resize-none"
            rows={3}
            {...register('notes')}
            placeholder="أضف ملاحظة اختيارية..."
          />
        </div>

        <div className="flex space-x-4 rtl:space-x-reverse pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            className="flex-1"
          >
            حفظ المعاملة
          </Button>
        </div>
      </form>
    </Modal>
  )
}