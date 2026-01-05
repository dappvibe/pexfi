import React from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { message, Space, Statistic } from 'antd'
import { useDealContext } from './Deal'
import LoadingButton from 'components/LoadingButton'
import { useContract } from 'hooks/useContract'
import Feedback from './Feedback'
import { equal } from 'utils'
import * as Types from 'types'

export default function Controls() {
  const { deal } = useDealContext()
  const { address } = useAccount()
  const { Token, Market, signed } = useContract()

  if (!address) return

  /**
   * Call the given method on Deal contract without params. Show a success message if provided.
   *
   * @param methodName
   * @param successMessage
   */
  async function call(methodName: string, successMessage: string = '') {
    const contract = await signed(deal.contract)
    try {
      const tx = await contract[methodName]()
      await tx.wait()
      if (successMessage) message.success(successMessage)
    } catch (e) {
      let parsed = deal.contract.interface.parseError(e.data)
      if (!parsed) parsed = Token.interface.parseError(e.data)
      if (parsed.name === 'ERC20InsufficientBalance') {
        message.error(`Not enough ${deal.token.symbol}. You have ${parsed.args[1]}`) // FIXME divide by decimals
      } else {
        message.error(parsed.args[0])
      }
      throw e
    }
  }

  /**
   * For sell deals owner funds contract before he can accept.
   */
  async function accept() {
    if (deal.offer.isSell) {
      const t = (await signed(Token.attach(deal.offer.token.address))) as Types.ERC20
      const allowance = await t.allowance(address, Market.target)
      if (allowance < deal.tokenAmount) {
        await t.approve(Market.target, ethers.MaxUint256)
      }
    }
    return call('accept', 'Accepted')
  }

  const isOwner = () => equal(address, deal.offer.owner)
  const isTaker = () => equal(address, deal.taker)
  const isBuyer = () => (deal.offer.isSell && isTaker()) || (!deal.offer.isSell && isOwner())
  const isSeller = () => (deal.offer.isSell && isOwner()) || (!deal.offer.isSell && isTaker())

  const State = {
    Initiated: 0,
    Accepted: 1,
    Funded: 2,
    Paid: 3,
    Disputed: 4,
    Cancelled: 5,
    Resolved: 6,
    Completed: 7,
  }

  const action = {
    countAccept: (
      <span>
        Waiting for acceptance: <Statistic.Countdown value={deal.allowCancelUnacceptedAfter} />
      </span>
    ),
    countPaid: (
      <span>
        Waiting for payment: <Statistic.Countdown value={deal.allowCancelUnpaidAfter} />
      </span>
    ),
    countCancel: (
      <span>
        Cancel in <Statistic.Countdown value={deal.allowCancelUnpaidAfter} />
      </span>
    ),
    accept: (
      <LoadingButton type={'primary'} onClick={accept}>
        Accept
      </LoadingButton>
    ),
    paid: (
      <LoadingButton type={'primary'} onClick={() => call('paid', 'Paid')}>
        Paid
      </LoadingButton>
    ),
    release: (
      <LoadingButton type={'primary'} onClick={() => call('release', 'Released')}>
        Release
      </LoadingButton>
    ),
    dispute: (
      <LoadingButton danger onClick={() => call('dispute', 'Disputed')}>
        Dispute
      </LoadingButton>
    ),
    cancel: (
      <LoadingButton danger onClick={() => call('cancel', 'Canceled')}>
        Cancel
      </LoadingButton>
    ),
  }
  const controls = []

  // TODO dispute timings so that it can't be started right away
  switch (true) {
    case deal.state === State.Initiated:
      if (isOwner()) {
        controls.push(action.accept)
        controls.push(action.cancel)
      }
      // FIXME acceptance time in contract is now 6 hours!! somewhere is timezone shift I guess
      if (isTaker()) {
        if (deal.allowCancelUnacceptedAfter > new Date()) {
          controls.push(action.countAccept)
        } else {
          controls.push(action.cancel)
        }
      }
      break

    case deal.state === State.Accepted:
      console.error('Accepted but not funded.') // FIXME UI response
      break

    case deal.state === State.Funded:
      if (isSeller()) {
        if (deal.allowCancelUnpaidAfter > new Date()) {
          controls.push(action.countPaid)
        } else {
          controls.push(action.cancel)
        }
      }
      if (isBuyer()) {
        controls.push(action.paid)
        controls.push(action.cancel)
      }
      break

    case deal.state === State.Paid:
      if (isSeller()) {
        controls.push(action.release)
        controls.push(action.dispute)
      }
      if (isBuyer()) {
        controls.push(action.dispute)
        controls.push(action.cancel)
      }
      break

    case deal.state === State.Disputed:
      if (isSeller()) {
        controls.push(action.release)
        controls.push(action.cancel)
      }
      if (isBuyer()) {
        controls.push(action.cancel)
      }
      break

    case deal.state === State.Cancelled:
    case deal.state === State.Resolved:
    case deal.state === State.Completed:
      break
  }

  if (deal.state < State.Completed) {
    return (
      <Space>
        {controls.map((button, index) => (
          <React.Fragment key={index}>{button}</React.Fragment>
        ))}
      </Space>
    )
  } else {
    return <Feedback />
  }
}
