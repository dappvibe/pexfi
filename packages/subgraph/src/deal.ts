import {Deal as DealContract, DealState as DealStateEvent, Message} from "../generated/templates/Deal/Deal"
import {Offer as OfferContract} from "../generated/templates/Offer/Offer"
import {Deal as DealEntity, DealMessage, Feedback, Notification, NotificationEvent, Offer} from "../generated/schema"
import {Address, Bytes, dataSource, log} from "@graphprotocol/graph-ts"
import {Market as MarketContract} from "../generated/Market/Market";
import {updateProfileFor} from "./profile";
import {FeedbackGiven} from "../generated/Market/Deal";

export function fetchDeal(dealAddress: Address): DealEntity {
  let dealContract = DealContract.bind(dealAddress)

  let deal = DealEntity.load(dealAddress.toHexString())
  if (deal == null) {
    deal = new DealEntity(dealAddress.toHexString())
    deal.messages = [];
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

export function indexDealAndProfile(address: Address): void {
  let deal = fetchDeal(address)
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

export function handleMessage(event: Message): void {
  let msg = new DealMessage(Bytes.fromUTF8(event.transaction.hash.toHexString() + event.logIndex.toHexString()))
  msg.sender = event.params.sender
  msg.message = event.params.message
  msg.createdAt = event.block.timestamp.toI32()
  msg.save()

  let deal = DealEntity.load(event.address.toHexString())
  if (!deal) {
    log.error("Deal not found for message: {}", [event.address.toHexString()])
    return;
  }
  let messages = deal.messages;
  messages.push(msg.id)
  deal.messages = messages
  deal.save()

  function notify(who: Bytes, event: Message, notificationEvent: NotificationEvent): void {
    const notification = new Notification(event.transaction.hash.toHexString() + event.logIndex.toHexString() + "-" + who.toHexString());
    notification.createdAt = event.block.timestamp.toI32();
    notification.deal = event.address.toHexString();
    notification.event = notificationEvent.id;
    notification.to = who;
    notification.save();
  }

  const notificationEvent = new NotificationEvent(event.transaction.hash.toHexString() + event.logIndex.toHexString());
  notificationEvent.name = 'Message';
  notificationEvent.arg0 = event.params.sender.toHexString();
  notificationEvent.save();

  let offer = Offer.load(deal.offer)
  if (!offer) {
    log.error("Offer not found for deal: {}", [deal.offer]);
    return;
  }
  if (event.params.sender != offer.owner) {
    notify(offer.owner, event, notificationEvent);
  }
  if (event.params.sender != deal.taker) {
    notify(deal.taker, event, notificationEvent);
  }
}

export function handleDealState(event: DealStateEvent): void {
  indexDealAndProfile(event.address)

  const notificationEvent = new NotificationEvent(event.transaction.hash.toHexString() + event.logIndex.toHexString());
  notificationEvent.name = 'DealState';
  notificationEvent.arg0 = event.params.state.toString();
  notificationEvent.arg1 = event.params.sender.toHexString();
  notificationEvent.save(); // at least one participant will be notified

  // closures are not supported in assemblyscript so pass all args
  function notify(who: Bytes, event: DealStateEvent, notificationEvent: NotificationEvent): void {
    const notification = new Notification(event.transaction.hash.toHexString() + event.logIndex.toHexString() + "-" + who.toHexString());
    notification.createdAt = event.block.timestamp.toI32();
    notification.deal = event.address.toHexString();
    notification.event = notificationEvent.id;
    notification.to = who;
    notification.save();
  }

  // owner
  let dealContract = DealContract.bind(event.address);
  let offerResult = dealContract.try_offer();
  if (!offerResult.reverted) {
    let offerAddress = offerResult.value;
    let offerContract = OfferContract.bind(offerAddress);
    let ownerResult = offerContract.try_owner();
    if (!ownerResult.reverted) {
      if (ownerResult.value != event.params.sender) {
        notify(ownerResult.value, event, notificationEvent);
      }
    }
  }

  // taker
  if (event.params.state > 0) {
    let takerResult = dealContract.try_taker();
    if (!takerResult.reverted) {
      if (takerResult.value != event.params.sender) {
        notify(takerResult.value, event, notificationEvent);
      }
    }
  }

  // mediator (on dispute)
  if (event.params.state == 4) {
    let context = dataSource.context();
    let marketAddress = context.getString('marketAddress');
    let marketContract = MarketContract.bind(Address.fromString(marketAddress));
    let mediatorResult = marketContract.try_mediator();
    if (!mediatorResult.reverted) {
      notify(mediatorResult.value, event, notificationEvent);
    }
  }
}

export function handleFeedbackGiven(event: FeedbackGiven): void {
  indexDealAndProfile(event.address)
}
