import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import Notifications from '@/components/Notifications'
import { useAccount } from 'wagmi'
import { useQuery } from '@apollo/client/react'

// Mock wagmi
vi.mock('wagmi', () => ({
    useAccount: vi.fn(),
}))

// Mock Apollo
const mockStartPolling = vi.fn()
const mockStopPolling = vi.fn()
const mockUseQuery = vi.fn()

vi.mock('@apollo/client/react', () => ({
    useQuery: (...args) => mockUseQuery(...args),
    gql: vi.fn(),
}))

// Mock Antd notification
const mockApiInfo = vi.fn()
vi.mock('antd', () => ({
    notification: {
        useNotification: () => [
            { info: mockApiInfo },
            <div>ContextHolder</div>
        ]
    }
}))

// Mock react-router
vi.mock('react-router-dom', () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>
}))


describe('Notifications', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    it('starts polling when connected', () => {
        vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)
        mockUseQuery.mockReturnValue({
            data: undefined,
            startPolling: mockStartPolling,
            stopPolling: mockStopPolling
        })

        render(<Notifications />)

        expect(mockUseQuery).toHaveBeenCalled()
        expect(mockStartPolling).toHaveBeenCalledWith(5000)
    })

    it('stops polling when disconnected', () => {
        vi.mocked(useAccount).mockReturnValue({ address: undefined } as any)
         mockUseQuery.mockReturnValue({
            data: undefined,
            startPolling: mockStartPolling,
            stopPolling: mockStopPolling
        })

        render(<Notifications />)
        expect(mockStopPolling).toHaveBeenCalled()
    })

    it('displays new notification', () => {
        vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)

        const mockNotification = {
            id: 'notif-1',
            createdAt: 12345,
            deal: { id: 'deal-1' },
            event: { name: 'DealState', arg0: '0' } // New Deal
        }

        mockUseQuery.mockReturnValue({
            data: { notifications: [mockNotification] },
            startPolling: mockStartPolling,
            stopPolling: mockStopPolling
        })

        render(<Notifications />)

        expect(mockApiInfo).toHaveBeenCalledWith(expect.objectContaining({
            key: 'notif-1',
            message: 'New Deal',
        }))

        expect(JSON.parse(localStorage.getItem('shownNotifications') || '[]')).toContain('notif-1')
    })

     it('does not display already shown notification', () => {
        vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)
        localStorage.setItem('shownNotifications', JSON.stringify(['notif-1']))

        const mockNotification = {
            id: 'notif-1',
            createdAt: 12345,
            deal: { id: 'deal-1' },
            event: { name: 'DealState', arg0: '0' }
        }

        mockUseQuery.mockReturnValue({
            data: { notifications: [mockNotification] },
            startPolling: mockStartPolling,
            stopPolling: mockStopPolling
        })

        render(<Notifications />)

        expect(mockApiInfo).not.toHaveBeenCalled()
    })
})
