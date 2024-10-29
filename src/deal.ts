import { DealState as DealStateEvent, FeedbackGiven as FeedbackGivenEvent } from "../generated/templates/Deal/Deal"
import {Deal as DealEntity, Offer} from "../generated/schema"
import {Address, BigInt, dataSource} from "@graphprotocol/graph-ts"
import {Market as MarketContract} from "../generated/Market/Market";
import {updateProfileFor} from "./profile";
import { log } from '@graphprotocol/graph-ts'

export function handleDealState(event: DealStateEvent): void {
  let deal = DealEntity.load(event.address.toHex())
  if (deal == null) {
    return;
  }
  deal.state = event.params.state
  deal.blockTimestamp = event.block.timestamp.toI32()
  deal.save()

  doUpdateProfile(deal)
}

export function handleFeedbackGiven(event: FeedbackGivenEvent): void {
  let deal = DealEntity.load(event.address.toHex())
  if (deal == null) {
    return;
  }
  doUpdateProfile(deal)
}

function doUpdateProfile(deal: DealEntity): void {
  let context = dataSource.context();
  let marketAddress = context.getString('marketAddress')
  let marketContract = MarketContract.bind(Address.fromString(marketAddress))
  let repTokenAddressResult = marketContract.try_repToken()
  if (repTokenAddressResult.reverted) {
    return
  }

  let repTokenAddress = repTokenAddressResult.value

  let offer = Offer.load(deal.offer)
  if (offer == null) {
    log.error("Offer not found for deal: {}", [deal.id])
    return;
  }
  updateProfileFor(repTokenAddress, Address.fromBytes(offer.owner))
  updateProfileFor(repTokenAddress, Address.fromBytes(deal.taker))
}
