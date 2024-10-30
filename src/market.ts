import {DealCreated, Market as MarketContract, OfferCreated as OfferCreatedEvent} from "../generated/Market/Market"
import {Deal as DealEntity, Offer as OfferEntity} from "../generated/schema"
import {Offer as OfferContract} from "../generated/Market/Offer"
import {Address, DataSourceContext} from "@graphprotocol/graph-ts"
import {Deal as DealTemplate} from "../generated/templates";
import {Deal as DealContract} from "../generated/templates/Deal/Deal"
import {updateProfileFor} from "./profile";

export function handleOfferCreated(event: OfferCreatedEvent): void {
  let offer = new OfferEntity(event.params.offer.toHex())
  offer.owner = event.params.owner
  // for some reason token/fiat from event is not a valid string

  // Fetch data from the newly created Offer contract
  let offerContract = OfferContract.bind(event.params.offer as Address)

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

  offer.blockTimestamp = event.block.timestamp.toI32()

  // Fetch RepToken address from Market contract
  let marketContract = MarketContract.bind(event.address)
  let repTokenAddressResult = marketContract.try_repToken()

  if (repTokenAddressResult.reverted) {
    return
  }

  let repTokenAddress = repTokenAddressResult.value
  let profile = updateProfileFor(repTokenAddress, event.params.owner)
  if (profile) {
    offer.profile = profile.id
  }
  offer.save()
}

export function handleDealCreated(event: DealCreated): void {
  // Create a new Deal entity
  let deal = new DealEntity(event.params.deal.toHex())

  // Bind the Deal contract to the event address
  let dealContract = DealContract.bind(event.params.deal as Address)

  // Request data from the Deal contract
  let stateResult = dealContract.try_state()
  if (!stateResult.reverted) {
    deal.state = stateResult.value
  }

  let offerResult = dealContract.try_offer()
  if (!offerResult.reverted) {
    deal.offer = offerResult.value.toHex()
  }

  let takerResult = dealContract.try_taker()
  if (!takerResult.reverted) {
    deal.taker = takerResult.value
  }

  let tokenAmountResult = dealContract.try_tokenAmount()
  if (!tokenAmountResult.reverted) {
    deal.tokenAmount = tokenAmountResult.value
  }

  let fiatAmountResult = dealContract.try_fiatAmount()
  if (!fiatAmountResult.reverted) {
    deal.fiatAmount = fiatAmountResult.value
  }

  let paymentInstructionsResult = dealContract.try_paymentInstructions()
  if (!paymentInstructionsResult.reverted) {
    deal.paymentInstructions = paymentInstructionsResult.value
  }

  deal.blockTimestamp = event.block.timestamp.toI32()

  // Save the Deal entity
  deal.save()

  // start listening to events from the new Deal contract
  let context = new DataSourceContext()
  context.setString('marketAddress', event.address.toHexString())
  DealTemplate.createWithContext(event.params.deal, context)
}
