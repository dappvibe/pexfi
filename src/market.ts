import {DealCreated, Market as MarketContract, OfferCreated as OfferCreatedEvent} from "../generated/Market/Market"
import {Deal as DealEntity } from "../generated/schema"
import {Address, DataSourceContext} from "@graphprotocol/graph-ts"
import {Deal as DealTemplate} from "../generated/templates";
import {Offer as OfferTemplate} from "../generated/templates";
import {Deal as DealContract} from "../generated/templates/Deal/Deal"
import {updateProfileFor} from "./profile";
import {fetchAndSaveOffer} from "./offer";

export function handleOfferCreated(event: OfferCreatedEvent): void {
  // start indexind the offer and delegate first fetch
  OfferTemplate.create(event.params.offer);

  const offer = fetchAndSaveOffer(event.params.offer);

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
