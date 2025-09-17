import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginForm } from './components/auth/LoginForm'
import { SignupForm } from './components/auth/SignupForm'
import { Dashboard } from './components/dashboard/Dashboard'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, loading, signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-gray-600">جاري التحميل...</p>
        </motion.div>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <LoginForm
              key="login"
              onLogin={signIn}
              onSwitchToSignup={() => setIsLogin(false)}
              loading={loading}
            />
          ) : (
            <SignupForm
              key="signup"
              onSignup={signUp}
              onSwitchToLogin={() => setIsLogin(true)}
              loading={loading}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App