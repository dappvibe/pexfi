import { useCallback } from 'react'
import { message } from 'antd'
import type { FormInstance } from 'antd'

interface UseOfferActionsParams {
  form: FormInstance
  setRate?: (rate: number) => Promise<void>
  setLimits?: (min: number, max: number) => Promise<void>
  setTerms?: (terms: string) => Promise<void>
  toggleDisabled?: () => Promise<void>
}

interface UseOfferActionsReturn {
  handleSetRate?: () => Promise<void>
  handleSetLimits?: () => Promise<void>
  handleSetTerms?: () => Promise<void>
  handleToggleDisabled?: () => Promise<void>
}

export function useOfferActions({
  form,
  setRate,
  setLimits,
  setTerms,
  toggleDisabled,
}: UseOfferActionsParams): UseOfferActionsReturn {
  const handleSetRate = useCallback(async () => {
    if (!setRate) return
    try {
      await setRate(form.getFieldValue('rate'))
      message.success('Rate updated')
    } catch (error: any) {
      message.error(error.message || 'Failed to update rate')
    }
  }, [form, setRate])

  const handleSetLimits = useCallback(async () => {
    if (!setLimits) return
    try {
      await setLimits(form.getFieldValue('min'), form.getFieldValue('max'))
      message.success('Limits updated')
    } catch (error: any) {
      message.error(error.message || 'Failed to update limits')
    }
  }, [form, setLimits])

  const handleSetTerms = useCallback(async () => {
    if (!setTerms) return
    try {
      await setTerms(form.getFieldValue('terms'))
      message.success('Terms updated')
    } catch (error: any) {
      message.error(error.message || 'Failed to update terms')
    }
  }, [form, setTerms])

  const handleToggleDisabled = useCallback(async () => {
    if (!toggleDisabled) return
    try {
      await toggleDisabled()
      message.success('State updated')
    } catch (error: any) {
      message.error(error.message || 'Failed to toggle state')
    }
  }, [toggleDisabled])

  return {
    handleSetRate: setRate ? handleSetRate : undefined,
    handleSetLimits: setLimits ? handleSetLimits : undefined,
    handleSetTerms: setTerms ? handleSetTerms : undefined,
    handleToggleDisabled: toggleDisabled ? handleToggleDisabled : undefined,
  }
}
