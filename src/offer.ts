import { OfferUpdated } from "../generated/templates/Offer/Offer";
import {Offer as OfferEntity, Offer} from "../generated/schema";
import {Offer as OfferContract} from "../generated/Market/Offer"
import {Address, log} from '@graphprotocol/graph-ts';

export function fetchAndSaveOffer(target: Address): Offer {
  let offerContract = OfferContract.bind(target)

  let offer = new OfferEntity(target.toHex())

  let ownerResult = offerContract.try_owner()
  if (!ownerResult.reverted) {
    offer.owner = ownerResult.value
  }

  let isSellResult = offerContract.try_isSell()
  if (!isSellResult.reverted) {
    offer.isSell = isSellResult.value
  }

  let tokenResult = offerContract.try_token()
  if (!tokenResult.reverted) {
    offer.token = tokenResult.value
  }

  let fiatResult = offerContract.try_fiat()
  if (!fiatResult.reverted) {
    offer.fiat = fiatResult.value
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
    offer.minFiat = limitsResult.value.getMin().toI32()
    offer.maxFiat = limitsResult.value.getMax().toI32()
  }

  let termsResult = offerContract.try_terms()
  if (!termsResult.reverted) {
    offer.terms = termsResult.value
  }

  let disabledResult = offerContract.try_disabled()
  if (!disabledResult.reverted) {
    offer.disabled = disabledResult.value
  }

  offer.save()
  return offer;
}

export function handleOfferUpdated(event: OfferUpdated): void {
  fetchAndSaveOffer(event.address)
}
