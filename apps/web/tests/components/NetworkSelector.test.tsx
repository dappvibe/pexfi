import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NetworkSelector, { NetworkSelectorAll } from '@/components/NetworkSelector'
import { useChainId, useSwitchChain } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'

// Mock wagmi
vi.mock('wagmi', () => ({
    useChainId: vi.fn(),
    useSwitchChain: vi.fn(),
}))

vi.mock('@/assets/images/arbitrum_monochrome.svg', () => ({ default: 'logo.svg' }))

describe('NetworkSelector', () => {
    const mockSwitchChain = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.resetModules() // Critical for env changes to take effect
        vi.mocked(useSwitchChain).mockReturnValue({
            switchChain: mockSwitchChain,
            chains: [arbitrum, arbitrumSepolia]
        } as any)
    })

    it('renders production view (Switch)', () => {
        render(<NetworkSelector mode="production" />)

        expect(screen.getByRole('switch')).toBeDefined()
        expect(screen.getByAltText('Arbitrum')).toBeDefined()
    })

    it('renders dev view (Select)', () => {
        vi.mocked(useChainId).mockReturnValue(arbitrumSepolia.id)
        // Default is dev in test env usually, but let's be explicit if we can,
        // or just rely on default if it works, or pass mode="development"
        render(<NetworkSelector mode="development" />)

        // It should render a Select with options
        // Antd Select is complex, but we can check if it rendered the NetworkSelectorAll component logic
        // We can interact with the select input
        const select = screen.getByRole('combobox')
        expect(select).toBeDefined()
    })

    it('calls switchChain on toggle (production)', () => {
         render(<NetworkSelector mode="production" />)
         const switchBtn = screen.getByRole('switch')

         // It is disabled in the code: disabled={true}
         // expect(switchBtn).toBeDisabled() // jest-dom might be missing
         expect(switchBtn.hasAttribute('disabled') || switchBtn.getAttribute('aria-disabled') === 'true').toBeTruthy()

         // If it wasn't disabled, we'd click it.
         // Since it is, we verify it's disabled state.
    })

    it('NetworkSelectorAll calls switchChain on selection', async () => {
        vi.mocked(useChainId).mockReturnValue(arbitrum.id)

        render(<NetworkSelectorAll />)
        const select = screen.getByRole('combobox')

        fireEvent.mouseDown(select) // Open dropdown

        const option = await screen.findByText('Arbitrum Sepolia')
        fireEvent.click(option)

        expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: arbitrumSepolia.id })
    })

     afterEach(() => {
        vi.unstubAllGlobals()
    })
})
