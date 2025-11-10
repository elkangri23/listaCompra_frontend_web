import React from 'react'
import styles from './form-container.module.css'

interface FormContainerProps {
  children: React.ReactNode
  title?: string
  description?: string
  footer?: React.ReactNode
  className?: string
}

export function FormContainer({ 
  children, 
  title, 
  description, 
  footer,
  className = '' 
}: FormContainerProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      {(title || description) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}
      
      <div className={styles.content}>
        {children}
      </div>
      
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
