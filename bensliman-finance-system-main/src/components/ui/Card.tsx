import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`
        bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20
        ${hover ? 'hover:shadow-xl transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}