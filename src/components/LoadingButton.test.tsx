import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import LoadingButton from '@/components/LoadingButton'

describe('LoadingButton', () => {
  it('renders children correctly', () => {
    render(<LoadingButton>Click Me</LoadingButton>)
    expect(screen.getByText('Click Me')).toBeDefined()
  })

  it('handles async click and shows loading state', async () => {
    let resolvePromise: () => void
    const mockOnClick = vi.fn().mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolvePromise = resolve
      })
    })

    const { container } = render(<LoadingButton onClick={mockOnClick}>Async Action</LoadingButton>)

    // Initial state: not loading
    const button = screen.getByRole('button')
    expect(button.className).not.toContain('ant-btn-loading')

    // Click
    fireEvent.click(button)
    expect(mockOnClick).toHaveBeenCalled()

    // Loading state
    expect(button.className).toContain('ant-btn-loading')

    // Resolve
    // @ts-ignore
    resolvePromise()

    await waitFor(() => {
      expect(button.className).not.toContain('ant-btn-loading')
    })
  })

  it('passes other props to Button', () => {
    render(<LoadingButton danger>Danger Button</LoadingButton>)
    const button = screen.getByRole('button')
    // ant-btn-dangerous is the class for danger prop
    expect(button.className).toContain('ant-btn-dangerous')
  })
})
