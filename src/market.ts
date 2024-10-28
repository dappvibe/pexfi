import {
  DealCreated as DealCreatedEvent,
  Initialized as InitializedEvent,
  OfferCreated as OfferCreatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Upgraded as UpgradedEvent
} from "../generated/Market/Market"
import {
  Offer,
  RepToken
} from "../generated/schema"

export function handleDealCreated(event: DealCreatedEvent): void {
  let entity = new DealCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.offerOwner = event.params.offerOwner
  entity.taker = event.params.taker
  entity.offer = event.params.offer
  entity.deal = event.params.deal

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOfferCreated(event: OfferCreatedEvent): void {
  let offer = new Offer(event.params.offer.toHex())
  offer.owner = event.params.owner
  offer.isSell = event.params.isSell
  offer.token = event.params.token.toString()
  offer.fiat = event.params.fiat.toString()
  offer.method = event.params.method.toString()
  offer.rate = event.params.rate.toI32()
  offer.minLimit = event.params.minLimit.toI32()
  offer.maxLimit = event.params.maxLimit.toI32()
  offer.terms = event.params.terms.toString()
  offer.blockNumber = event.block.number
  offer.blockTimestamp = event.block.timestamp
  offer.transactionHash = event.transaction.hash

  offer.save()
}
