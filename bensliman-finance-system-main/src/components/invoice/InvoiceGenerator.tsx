import React, { useRef, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Download, Share2, Printer, X, FileText } from 'lucide-react'
import { Button } from '../ui/Button'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

interface InvoiceGeneratorProps {
  transaction: Transaction
  isOpen: boolean
  onClose: () => void
}

const typeLabels = {
  exit: 'خروج',
  sell_to: 'بيع إلى',
  buy: 'شراء من',
  entry: 'دخول'
}

const typeColors = {
  exit: 'from-red-500 to-red-600',
  sell_to: 'from-green-500 to-green-600',
  buy: 'from-blue-500 to-blue-600',
  entry: 'from-purple-500 to-purple-600'
}

// Helper function to convert Arabic numerals to English
const toEnglishNumbers = (str: string | number): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  
  let result = str.toString()
  for (let i = 0; i < arabicNumbers.length; i++) {
    result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i])
  }
  return result
}

// Helper function to format numbers with English numerals
const formatNumber = (num: number): string => {
  return toEnglishNumbers(num.toLocaleString('en-US'))
}

export function InvoiceGenerator({ transaction, isOpen, onClose }: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Smart positioning when modal opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const modalRect = modalRef.current.getBoundingClientRect()
          const viewportHeight = window.innerHeight
          const modalHeight = modalRect.height
          
          // Calculate if modal fits in current viewport
          const currentScrollY = window.scrollY
          const modalTop = modalRect.top + currentScrollY
          
          // If modal is not fully visible, scroll to show it optimally
          if (modalRect.top < 0 || modalRect.bottom > viewportHeight) {
            // Calculate optimal scroll position
            let targetScrollY
            
            if (modalHeight >= viewportHeight * 0.9) {
              // If modal is very tall, scroll to show the top
              targetScrollY = modalTop - 20
            } else {
              // Center the modal in viewport
              targetScrollY = modalTop - (viewportHeight - modalHeight) / 2
            }
            
            // Ensure we don't scroll above the document
            targetScrollY = Math.max(0, targetScrollY)
            
            // Smooth scroll to optimal position
            window.scrollTo({
              top: targetScrollY,
              behavior: 'smooth'
            })
          }
        }
      }, 100)

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'

      return () => {
        clearTimeout(timer)
        document.body.style.overflow = 'unset'
      }
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const generatePDFBlob = async (): Promise<Blob | null> => {
    if (!invoiceRef.current) return null

    try {
      // Create canvas from the invoice element with better settings for logo
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
      })

      // Create PDF with single page that fits content
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Scale down if content is too tall for single page
      if (imgHeight > pageHeight) {
        const scaleFactor = pageHeight / imgHeight
        const scaledWidth = imgWidth * scaleFactor
        const scaledHeight = pageHeight
        const xOffset = (imgWidth - scaledWidth) / 2
        
        pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight)
      } else {
        // Center vertically if content is smaller than page
        const yOffset = (pageHeight - imgHeight) / 2
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight)
      }

      // Return PDF as blob
      return pdf.output('blob')
    } catch (error) {
      console.error('Error generating PDF blob:', error)
      return null
    }
  }

  const generatePDF = async () => {
    if (!invoiceRef.current) return

    setIsGenerating(true)
    
    try {
      const pdfBlob = await generatePDFBlob()
      if (!pdfBlob) {
        alert('حدث خطأ أثناء إنشاء ملف PDF')
        return
      }

      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      const fileName = `إيصال-${typeLabels[transaction.type]}-${transaction.id.slice(0, 8)}.pdf`
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('تم تحميل الإيصال بصيغة PDF بنجاح!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('حدث خطأ أثناء إنشاء ملف PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    if (!invoiceRef.current) return
    
    const printContent = invoiceRef.current.innerHTML
    const originalContent = document.body.innerHTML
    
    document.body.innerHTML = `
      <div style="direction: rtl; font-family: Arial, sans-serif;">
        ${printContent}
      </div>
    `
    
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  const handleShare = async () => {
    setIsSharing(true)
    
    try {
      const pdfBlob = await generatePDFBlob()
      if (!pdfBlob) {
        alert('حدث خطأ أثناء إنشاء ملف PDF للمشاركة')
        return
      }

      const fileName = `إيصال-${typeLabels[transaction.type]}-${transaction.id.slice(0, 8)}.pdf`
      
      // Create a File object from the blob with proper PDF MIME type
      const pdfFile = new File([pdfBlob], fileName, { 
        type: 'application/pdf',
        lastModified: Date.now()
      })

      const shareData = {
        title: `إيصال ${typeLabels[transaction.type]}`,
        text: `إيصال ${typeLabels[transaction.type]} - المبلغ: ${formatNumber(transaction.amount)} ${transaction.currency}`,
        files: [pdfFile]
      }

      // Check if the browser supports sharing files and can share this data
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData)
          alert('تم مشاركة الإيصال بنجاح!')
        } catch (shareError: any) {
          if (shareError.name !== 'AbortError') {
            console.error('Error sharing:', shareError)
            // Fallback to download if sharing fails
            await fallbackDownload(pdfBlob, fileName)
          }
        }
      } else if (navigator.share) {
        // Try sharing without files (text only) and then download
        try {
          await navigator.share({
            title: shareData.title,
            text: shareData.text + '\n\nسيتم تحميل ملف PDF...'
          })
          // Download the PDF after sharing text
          await fallbackDownload(pdfBlob, fileName)
        } catch (shareError: any) {
          if (shareError.name !== 'AbortError') {
            await fallbackDownload(pdfBlob, fileName)
          }
        }
      } else {
        // No Web Share API support, fallback to download
        await fallbackDownload(pdfBlob, fileName)
      }
    } catch (error) {
      console.error('Error in share process:', error)
      alert('حدث خطأ أثناء مشاركة الإيصال')
    } finally {
      setIsSharing(false)
    }
  }

  const fallbackDownload = async (pdfBlob: Blob, fileName: string) => {
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('تم تحميل الإيصال - يمكنك مشاركتها من مجلد التحميلات')
  }

  // Get footer text based on transaction type
  const getFooterText = () => {
    const currentDate = format(new Date(), 'dd/MM/yyyy, hh:mm a', { locale: ar })
    const englishDate = toEnglishNumbers(currentDate)
    
    switch (transaction.type) {
      case 'entry':
        return `تم إنشاء إيصال دخول في ${englishDate}`
      case 'exit':
        return `تم إنشاء إيصال خروج في ${englishDate}`
      case 'sell_to':
        return `تم إنشاء إيصال بيع في ${englishDate}`
      case 'buy':
        return `تم إنشاء إيصال شراء في ${englishDate}`
      default:
        return `تم إنشاء هذا الإيصال في ${englishDate}`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Action Buttons - Fixed Header */}
        <div className="sticky top-0 bg-white/98 backdrop-blur-sm border-b border-gray-200 p-4 flex justify-between items-center z-20 shadow-sm">
          <div className="flex space-x-3 rtl:space-x-reverse">
            <Button
              variant="primary"
              icon={Download}
              onClick={generatePDF}
              loading={isGenerating}
              disabled={isGenerating || isSharing}
              size="sm"
            >
              {isGenerating ? 'جاري الإنشاء...' : 'تحميل PDF'}
            </Button>
            <Button
              variant="outline"
              icon={Printer}
              onClick={handlePrint}
              disabled={isGenerating || isSharing}
              size="sm"
            >
              طباعة
            </Button>
            <Button
              variant="outline"
              icon={Share2}
              onClick={handleShare}
              loading={isSharing}
              disabled={isGenerating || isSharing}
              size="sm"
            >
              {isSharing ? 'جاري المشاركة...' : 'مشاركة PDF'}
            </Button>
          </div>
          <Button
            variant="ghost"
            icon={X}
            onClick={onClose}
            size="sm"
            className="hover:bg-red-50 hover:text-red-600"
          >
            إغلاق
          </Button>
        </div>

        {/* Invoice Content - Scrollable with Fixed PDF Width */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="flex justify-center">
            {/* Fixed width container that maintains PDF dimensions */}
            <div className="w-full max-w-none overflow-x-auto">
              <div className="flex justify-center min-w-[794px]">
                <div 
                  ref={invoiceRef}
                  className="bg-white shadow-lg"
                  style={{ 
                    width: '794px', // Fixed A4 width in pixels at 96 DPI
                    minHeight: '800px',
                    margin: '0 auto',
                    padding: '0',
                    fontFamily: 'Arial, sans-serif',
                    flexShrink: 0 // Prevent shrinking
                  }}
                >
                  {/* Header with decorative elements */}
                  <div className="relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path
                          d="M0,20 Q25,0 50,20 T100,20"
                          fill="none"
                          stroke="#9F7C56"
                          strokeWidth="0.5"
                        />
                        <path
                          d="M0,40 Q25,60 50,40 T100,40"
                          fill="none"
                          stroke="#9F7C56"
                          strokeWidth="0.5"
                        />
                        <path
                          d="M0,60 Q25,80 50,60 T100,60"
                          fill="none"
                          stroke="#9F7C56"
                          strokeWidth="0.5"
                        />
                        <path
                          d="M0,80 Q25,100 50,80 T100,80"
                          fill="none"
                          stroke="#9F7C56"
                          strokeWidth="0.5"
                        />
                      </svg>
                    </div>
                    
                    {/* Header content */}
                    <div className="relative z-10 text-center py-8 px-12">
                      {/* Company logo area */}
                      <div className="mb-6">
                        <div className="w-40 h-40 mx-auto mb-3">
                          <img 
                            src="/applogo.png" 
                            alt="App Logo" 
                            className="w-full h-full object-contain"
                            crossOrigin="anonymous"
                            style={{
                              maxWidth: '100%',
                              height: 'auto',
                              display: 'block'
                            }}
                            onError={(e) => {
                              console.error('Logo failed to load:', e)
                              // Hide the image if it fails to load
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      </div>

                      {/* Transaction type badge */}
                      <div className={`inline-block px-6 py-2 rounded-full bg-[#9F7C56] text-white text-lg font-bold mb-4`}>
                        {typeLabels[transaction.type]}
                      </div>

                      {/* Invoice number and date */}
                      <div className="text-gray-600">
                        <p className="text-sm">التاريخ: {toEnglishNumbers(format(new Date(transaction.created_at), 'PPP', { locale: ar }))}</p>
                      </div>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="px-12 py-4">
                    {/* Transaction details in a form-like layout */}
                    <div className="bg-[#9F7C56]/5 rounded-2xl p-6 mb-6 border border-[#9F7C56]/20">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left column */}
                        <div className="space-y-4">
                          {/* entry type fields (LEFT: في حساب, استلمت من) */}
                          {transaction.type === 'entry' && (
                            <>
                              {transaction.to_account && (
                                <div className="flex items-center">
                                  <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">في حساب:</label>
                                  <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                    <span className="text-gray-900 font-semibold text-sm">{transaction.to_account}</span>
                                  </div>
                                </div>
                              )}
                              {transaction.deliver_to && (
                                <div className="flex items-center">
                                  <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">استلمت من:</label>
                                  <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                    <span className="text-gray-900 font-semibold text-sm">{transaction.deliver_to}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          {/* exit type fields (LEFT: من حساب, تسليم الى) */}
                          {transaction.type === 'exit' && (
                            <>
                              {transaction.from_account && (
                                <div className="flex items-center">
                                  <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">من حساب:</label>
                                  <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                    <span className="text-gray-900 font-semibold text-sm">{transaction.from_account}</span>
                                  </div>
                                </div>
                              )}
                              {transaction.deliver_to && (
                                <div className="flex items-center">
                                  <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">تسليم الى:</label>
                                  <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                    <span className="text-gray-900 font-semibold text-sm">{transaction.deliver_to}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          {/* sell_to and buy type fields (LEFT COLUMN: الاسم, البلد/المدينة) */}
                          {(transaction.type === 'sell_to' || transaction.type === 'buy') && (
                            <>
                              {transaction.name && (
                                <div className="flex items-center">
                                  <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">الاسم:</label>
                                  <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                    <span className="text-gray-900 font-semibold text-sm">{transaction.name}</span>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center">
                                <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">البلد/المدينة:</label>
                                <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                  <span className="text-gray-900 font-semibold text-sm">{transaction.country_city}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Right column for entry/exit and for sell_to/buy */}
                        <div className="space-y-4">
                          {/* entry type fields (RIGHT: المبلغ, البلد/المدينة) */}
                          {transaction.type === 'entry' && (
                            <>
                              <div className="flex items-center">
                                <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">المبلغ:</label>
                                <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                  <span className="text-gray-900 font-semibold">
                                    {formatNumber(transaction.amount)} {transaction.currency}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">البلد/المدينة:</label>
                                <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                  <span className="text-gray-900 font-semibold text-sm">{transaction.country_city}</span>
                                </div>
                              </div>
                            </>
                          )}
                          {/* exit type fields (RIGHT: المبلغ, البلد/المدينة) */}
                          {transaction.type === 'exit' && (
                            <>
                              <div className="flex items-center">
                                <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">المبلغ:</label>
                                <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                  <span className="text-gray-900 font-semibold">
                                    {formatNumber(transaction.amount)} {transaction.currency}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">البلد/المدينة:</label>
                                <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                  <span className="text-gray-900 font-semibold text-sm">{transaction.country_city}</span>
                                </div>
                              </div>
                            </>
                          )}
                          {/* sell_to and buy type fields (RIGHT COLUMN: المبلغ, السعر) */}
                          {(transaction.type === 'sell_to' || transaction.type === 'buy') && (
                            <>
                              <div className="flex items-center">
                                <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">المبلغ:</label>
                                <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                  <span className="text-gray-900 font-semibold">
                                    {formatNumber(transaction.amount)} {transaction.currency}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <label className="w-20 text-right text-[#9F7C56] font-medium ml-3 text-sm">السعر:</label>
                                <div className="flex-1 border-b-2 border-[#9F7C56]/30 pb-1">
                                  <span className="text-gray-900 font-semibold">
                                    {formatNumber(transaction.price)} 
                                  </span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes section */}
                    {transaction.notes && (
                      <div className="mb-6">
                        <label className="block text-[#9F7C56] font-medium mb-2 text-sm">ملاحظة:</label>
                        <div className="bg-[#9F7C56]/5 border-2 border-[#9F7C56]/20 rounded-xl p-4">
                          <p className="text-gray-800 leading-relaxed text-sm">{transaction.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="text-center py-6 px-12 border-t-2 border-[#9F7C56]/20 mt-6">
                      <p className="text-[#9F7C56] mb-2 text-sm">نعيد تعريف الصرافه خطوة بخطوة</p>
                      <p className="text-xs text-[#9F7C56]/70">
                        {getFooterText()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}