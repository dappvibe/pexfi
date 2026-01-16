import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Username from '@/components/Username'
import { formatAddress } from '@/utils'

// Mock formatAddress util if needed, but it's pure
vi.mock('@/utils', () => ({
    formatAddress: (addr: string) => `formatted-${addr}`
}))

// Mock react-router
vi.mock('react-router-dom', () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>
}))

describe('Username', () => {
    const address = '0x123'

    it('renders basic address when no profile data', () => {
        render(<Username address={address} />)

        expect(screen.getByText('formatted-0x123 (-; ??%)')).toBeDefined()
        const link = screen.getByRole('link') as HTMLAnchorElement
        expect(link.getAttribute('href')).toBe('/profile/0x123')
    })

    it('renders profile stats', () => {
         const profile = { dealsCompleted: 5, rating: 98 }
         render(<Username address={address} profile={profile} />)

         expect(screen.getByText('formatted-0x123 (5; 98%)')).toBeDefined()
    })

    it('renders avatar when enabled', () => {
        render(<Username address={address} avatar={true} />)

        // Antd Avatar usually renders an image or div.
        // We can check for the img src if it renders an img tag
        const img = screen.getByRole('img') as HTMLImageElement
        expect(img.src).toContain(`https://effigy.im/a/${address}.svg`)
    })
})
