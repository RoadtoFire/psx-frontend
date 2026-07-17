// Table primitives. Wrap in <Card bodyClassName=""> (or any panel) and the
// TableWrap handles horizontal scroll on narrow screens.
export function TableWrap({ children }) {
  return <div className="overflow-x-auto">{children}</div>
}

export function Table({ children, className = '' }) {
  return <table className={`w-full ${className}`}>{children}</table>
}

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' }

export function Th({ align = 'left', className = '', children }) {
  return (
    <th className={`px-4 py-3 ${ALIGN[align]} text-ink-dim text-xs uppercase tracking-wider font-medium whitespace-nowrap ${className}`}>
      {children}
    </th>
  )
}

export function Td({ align = 'left', className = '', children }) {
  return <td className={`px-4 py-4 ${ALIGN[align]} ${className}`}>{children}</td>
}

export function Tr({ className = '', children, ...props }) {
  return (
    <tr className={`hover:bg-gray-800/40 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  )
}
