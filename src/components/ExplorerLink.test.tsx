import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ExplorerLink from '@/components/ExplorerLink'

describe('ExplorerLink', () => {
  it('renders link with address', () => {
    const address = '0x123'
    render(<ExplorerLink address={address}>View Address</ExplorerLink>)

    const link = screen.getByText('View Address') as HTMLAnchorElement
    // Note: Component currently hardcodes http://localhost/address/
    expect(link.href).toBe(`http://localhost/address/${address}`)
  })

  // The component ignores `tx` prop currently based on my read, so we stick to what it does.
  // If it supported tx, we'd test that too.
})
