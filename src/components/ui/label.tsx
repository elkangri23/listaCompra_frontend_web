'use client'

import * as React from 'react'
import { clsx } from 'clsx'

import styles from './label.module.css'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, isRequired = false, ...props }, ref) => {
    const isDisabled =
      props['data-disabled'] === '' ||
      props['data-disabled'] === true ||
      props['aria-disabled'] === true ||
      props['aria-disabled'] === 'true'

    return (
      <label
        ref={ref}
        className={clsx(
          styles.labelBase,
          isDisabled && styles.labelDisabled,
          className,
        )}
        {...props}
      >
        <span className={styles.labelContent}>
          {children}
          {isRequired ? (
            <span aria-hidden="true" className={styles.requiredAsterisk}>
              *
            </span>
          ) : null}
        </span>
      </label>
    )
  },
)
Label.displayName = 'Label'

export { Label }
