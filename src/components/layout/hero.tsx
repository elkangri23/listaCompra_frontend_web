import React from 'react'
import styles from './hero.module.css'

interface HeroProps {
  imageUrl: string
  alt?: string
  height?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Hero({ imageUrl, alt = '', height = 'md', className = '' }: HeroProps) {
  return (
    <div 
      className={`${styles.hero} ${styles[`hero--${height}`]} ${className}`}
      style={{ backgroundImage: `url(${imageUrl})` }}
      role="img"
      aria-label={alt}
    />
  )
}
