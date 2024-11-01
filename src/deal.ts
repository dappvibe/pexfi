import {Deal as DealContract, DealState as DealStateEvent, FeedbackGiven as FeedbackGivenEvent} from "../generated/templates/Deal/Deal"
import {Deal as DealEntity, Feedback, Offer} from "../generated/schema"
import {Address, BigInt, dataSource} from "@graphprotocol/graph-ts"
import {Market as MarketContract} from "../generated/Market/Market";
import {updateProfileFor} from "./profile";
import { log } from '@graphprotocol/graph-ts'

export function fetchDeal(dealAddress: Address): DealEntity {
  let dealContract = DealContract.bind(dealAddress)

  let deal = DealEntity.load(dealAddress.toHexString())
  if (deal == null) {
    deal = new DealEntity(dealAddress.toHexString())
  }

  let stateResult = dealContract.try_state()
  if (!stateResult.reverted) deal.state = stateResult.value

  let offerResult = dealContract.try_offer()
  if (!offerResult.reverted) deal.offer = offerResult.value.toHex()

  let takerResult = dealContract.try_taker()
  if (!takerResult.reverted) deal.taker = takerResult.value

  let tokenAmountResult = dealContract.try_tokenAmount()
  if (!tokenAmountResult.reverted) deal.tokenAmount = tokenAmountResult.value

  let fiatAmountResult = dealContract.try_fiatAmount()
  if (!fiatAmountResult.reverted) deal.fiatAmount = fiatAmountResult.value

  let termsResult = dealContract.try_terms();
  if (!termsResult.reverted) deal.terms = termsResult.value;

  let paymentInstructionsResult = dealContract.try_paymentInstructions()
  if (!paymentInstructionsResult.reverted) deal.paymentInstructions = paymentInstructionsResult.value

  let allowCancelUnacceptedAfterResult = dealContract.try_allowCancelUnacceptedAfter();
  if (!allowCancelUnacceptedAfterResult.reverted) deal.allowCancelUnacceptedAfter = allowCancelUnacceptedAfterResult.value.toI32();

  let allowCancelUnpaidAfterResult = dealContract.try_allowCancelUnpaidAfter();
  if (!allowCancelUnpaidAfterResult.reverted) deal.allowCancelUnpaidAfter = allowCancelUnpaidAfterResult.value.toI32();

  let feedbackForOwner = dealContract.try_feedbackForOwner();
  if (!feedbackForOwner.reverted) {
    if (feedbackForOwner.value.getGiven()) {
      let fb = new Feedback(`${dealAddress.toHexString()}-owner`);
      fb.given = feedbackForOwner.value.getGiven();
      fb.upvote = feedbackForOwner.value.getUpvote();
      fb.message = feedbackForOwner.value.getMessage();
      fb.save();
      deal.feedbackForOwner = fb.id;
    }
  }

  let feedbackForTaker = dealContract.try_feedbackForTaker();
  if (!feedbackForTaker.reverted) {
    if (feedbackForTaker.value.getGiven()) {
      let fb = new Feedback(`${dealAddress.toHexString()}-taker`);
      fb.given = feedbackForTaker.value.getGiven();
      fb.upvote = feedbackForTaker.value.getUpvote();
      fb.message = feedbackForTaker.value.getMessage();
      fb.save();
      deal.feedbackForTaker = fb.id;
    }
  }

  return deal;
}

export function indexDealAndProfile(event: DealStateEvent): void {
  let deal = fetchDeal(event.address)
  deal.save();
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
