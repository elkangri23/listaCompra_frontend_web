// Stub - TODO: Implement proper pagination components
export const Pagination = ({ children, ...props }: any) => <nav {...props}>{children}</nav>
export const PaginationContent = ({ children, ...props }: any) => <ul {...props}>{children}</ul>
export const PaginationItem = ({ children, ...props }: any) => <li {...props}>{children}</li>
export const PaginationLink = ({ children, ...props }: any) => <a {...props}>{children}</a>
export const PaginationNext = ({ children, ...props }: any) => <button {...props}>{children}</button>
export const PaginationPrevious = ({ children, ...props }: any) => <button {...props}>{children}</button>
export const PaginationEllipsis = ({ ...props }: any) => <span {...props}>...</span>
