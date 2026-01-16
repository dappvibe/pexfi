import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import ChatWidget from '@/components/ChatWidget'

describe('ChatWidget', () => {
  it('injects Crisp script tag', () => {
    // Mock import.meta.env
    // @ts-ignore
    vi.stubGlobal('import.meta', { env: { VITE_CRISP_ID: 'test-crisp-id' } })

    // Spy on appendChild
    const appendSpy = vi.spyOn(document.head, 'appendChild')

    render(<ChatWidget />)

    expect(window.$crisp).toEqual([])
    expect(window.CRISP_WEBSITE_ID).toEqual(expect.any(String))

    expect(appendSpy).toHaveBeenCalled()
    const script = appendSpy.mock.calls[0][0] as HTMLScriptElement
    expect(script.src).toBe('https://client.crisp.chat/l.js')
    expect(script.async).toBe(true)

    vi.unstubAllGlobals()
  })
})
