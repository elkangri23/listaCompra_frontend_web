import * as React from 'react'
import styles from './layout.module.css'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div id="contenido" tabIndex={-1} className={styles.root}>
      {children}
    </div>
  )
}
