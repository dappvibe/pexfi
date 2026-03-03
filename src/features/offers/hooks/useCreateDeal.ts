import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, message } from 'antd'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'
import { useContract } from '@/hooks/useContract'
import { useOffer } from '@/features/offers/hooks/useOffer'

export function useCreateDeal() {
  const navigate = useNavigate()
  const account = useAccount()
  const { Market, Offer: OfferContract, signed } = useContract()

  const { offerId } = useParams()
  const { offer, allowance, setAllowance, token, setRate, setLimits, setTerms, toggleDisabled } = useOffer(offerId, {
    fetchPrice: true,
    fetchAllowance: true,
  })

  const [form] = Form.useForm()
  const [lockButton, setLockButton] = useState(false)

  const isOwner = !!account.address && !!offer && offer.owner.toLowerCase() === account.address.toLowerCase()

  async function approve() {
    if (allowance > 0 || offer.isSell) return Promise.resolve()

    const t = await signed(token)
    return t.approve(Market.target, ethers.MaxUint256).then((tx) => {
      tx.wait().then(() => {
        token.allowance(account.address, Market.target).then(setAllowance)
      })
    })
  }

  async function createDeal(offer, values) {
    setLockButton(true)
    await approve()

    const offerContract = OfferContract.attach(offer.address)
    const signedOffer = await signed(offerContract)
    const amount = BigInt(values['fiatAmount'] * 10 ** 6)

    try {
      const tx = await signedOffer.createDeal(Market.target, {
        fiatAmount: amount,
        paymentInstructions: values['paymentInstructions'] ?? '',
      })
      message.info('Deal submitted. You will be redirected shortly.')
      const receipt = await tx.wait()
      receipt.logs.forEach((log) => {
        const DealCreated = Market.interface.parseLog(log)
        if (DealCreated && DealCreated.name == 'DealCreated') {
          navigate(`/trade/deal/${DealCreated.args[3]}`)
        }
      })
      setLockButton(false)
    } catch (e) {
      if (token && e.data) {
        try {
          const error = token.interface.parseError(e.data)
          if (error.name === 'ERC20InsufficientBalance') {
            message.error(`Not enough ${offer.token}. You have ${error.args[1]}`)
          } else {
            message.error(e.shortMessage)
          }
        } catch (e2) {
          message.error(e.shortMessage)
        }
      } else {
        message.error(e.shortMessage)
      }
    }
    setLockButton(false)
  }

  const syncTokenAmount = (fiat: string) => {
    if (!offer) return
    const value = fiat.length > 0 ? (Number(fiat) / offer.price).toFixed(8) : ''
    form.setFieldValue('tokenAmount', value)
  }

  const syncFiatAmount = (token: string) => {
    if (!offer) return
    const value = token.length > 0 ? (Number(token) * offer.price).toFixed(2) : ''
    form.setFieldValue('fiatAmount', value)
    form.validateFields(['fiatAmount'])
  }

  let submitLabel = 'Open Deal'
  let submitDisabled = !account
  if (offer && !offer.isSell && !allowance) {
    submitLabel = `Approve ${offer.token}`
  }
  if (offer && offer.disabled) {
    submitLabel = 'Offer is disabled'
    submitDisabled = true
  }

  return {
    offer,
    form,
    isOwner,
    lockButton,
    submitLabel,
    submitDisabled,
    createDeal,
    syncTokenAmount,
    syncFiatAmount,
    setRate,
    setLimits,
    setTerms,
    toggleDisabled,
  }
}
