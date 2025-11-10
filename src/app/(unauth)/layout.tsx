import * as React from 'react'
import styles from './layout.module.css'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.root}>
      {children}
    </div>
  )
}
