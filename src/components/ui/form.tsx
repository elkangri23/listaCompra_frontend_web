// Stub - TODO: Implement proper form components
export const Form = ({ children, ...props }: any) => <form {...props}>{children}</form>
export const FormControl = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const FormDescription = ({ children, ...props }: any) => <p {...props}>{children}</p>
export const FormField = ({ render, control, name, ...props }: any) => {
  const field = { name, value: '', onChange: () => {}, onBlur: () => {}, ref: () => {} }
  return render({ field, fieldState: {}, formState: {} })
}
export const FormItem = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const FormLabel = ({ children, ...props }: any) => <label {...props}>{children}</label>
export const FormMessage = ({ children, ...props }: any) => <span {...props}>{children}</span>
