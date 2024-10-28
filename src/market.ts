import {OfferCreated as OfferCreatedEvent} from "../generated/Market/Market"
import {Offer as OfferEntity} from "../generated/schema"
import {Offer as OfferContract} from "../generated/Market/Offer"
import {Address} from "@graphprotocol/graph-ts"

export function handleOfferCreated(event: OfferCreatedEvent): void {
  let offer = new OfferEntity(event.params.offer.toHex())
  offer.owner = event.params.owner
  offer.token = event.params.token.toHexString()
  offer.fiat = event.params.fiat.toHexString()

  // Fetch data from the newly created Offer contract
  let offerContract = OfferContract.bind(event.params.offer as Address)

  let isSellResult = offerContract.try_isSell()
  if (!isSellResult.reverted) {
    offer.isSell = isSellResult.value
  }

  let methodResult = offerContract.try_method()
  if (!methodResult.reverted) {
    offer.method = methodResult.value
  }

  let rateResult = offerContract.try_rate()
  if (!rateResult.reverted) {
    offer.rate = rateResult.value
  }

  let limitsResult = offerContract.try_limits()
  if (!limitsResult.reverted) {
    offer.minLimit = limitsResult.value.getMin()
    offer.maxLimit = limitsResult.value.getMax()
  }

  let termsResult = offerContract.try_terms()
  if (!termsResult.reverted) {
    offer.terms = termsResult.value
  }

  offer.blockNumber = event.block.number
  offer.blockTimestamp = event.block.timestamp
  offer.transactionHash = event.transaction.hash

  offer.save()
}
