import {Deal as DealContract, DealState as DealStateEvent, Message} from "../../.cache/subgraph/generated/templates/Deal/Deal"
import {Offer as OfferContract} from "../../.cache/subgraph/generated/templates/Offer/Offer"
import {Deal as DealEntity, DealMessage, Feedback, Notification, NotificationEvent, Offer} from "../../.cache/subgraph/generated/schema"
import {Address, Bytes, dataSource, log} from "@graphprotocol/graph-ts"
import {Market as MarketContract} from "../../.cache/subgraph/generated/Market/Market";
import {Finder as FinderContract} from "../../.cache/subgraph/generated/Market/Finder";
import {updateProfileFor} from "./profile";
import {FeedbackGiven} from "../../.cache/subgraph/generated/templates/Deal/Deal";

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

  let allowCancelUnacceptedAfterResult = dealContract.try_allowCancelUnacceptedAfter();
  if (!allowCancelUnacceptedAfterResult.reverted) deal.allowCancelUnacceptedAfter = allowCancelUnacceptedAfterResult.value.toI32();

  let allowCancelUnpaidAfterResult = dealContract.try_allowCancelUnpaidAfter();
  if (!allowCancelUnpaidAfterResult.reverted) deal.allowCancelUnpaidAfter = allowCancelUnpaidAfterResult.value.toI32();

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

  let finderResult = marketContract.try_finder();
  if (finderResult.reverted) {
    return
  }

  let finderContract = FinderContract.bind(finderResult.value);
  let profileAddressResult = finderContract.try_getImplementationAddress(Bytes.fromHexString("0x50726f66696c6500000000000000000000000000000000000000000000000000") as Bytes);
  if (profileAddressResult.reverted) {
    return;
  }
  let profileAddress = profileAddressResult.value

  let offer = Offer.load(deal.offer)
  if (offer == null) {
    log.error("Offer not found for deal: {}", [deal.id])
    return;
  }
  updateProfileFor(profileAddress, Address.fromBytes(offer.owner))
  updateProfileFor(profileAddress, Address.fromBytes(deal.taker))
}

export function handleMessage(event: Message): void {
  log.info("Message: deal={}, sender={}, message={}", [
    event.address.toHexString(),
    event.params.sender.toHexString(),
    event.params.message
  ]);
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
  log.info("DealState: deal={}, state={}, sender={}", [
    event.address.toHexString(),
    event.params.state.toString(),
    event.params.sender.toHexString()
  ]);
  indexDealAndProfile(event.address)

  const notificationEvent = new NotificationEvent(event.transaction.hash.toHexString() + event.logIndex.toHexString());
  notificationEvent.name = 'DealState';
  notificationEvent.arg0 = event.params.state.toString();
  notificationEvent.arg1 = event.params.sender.toHexString();
  notificationEvent.save();

  function notify(who: Bytes, event: DealStateEvent, notificationEvent: NotificationEvent): void {
    const notification = new Notification(event.transaction.hash.toHexString() + event.logIndex.toHexString() + "-" + who.toHexString());
    notification.createdAt = event.block.timestamp.toI32();
    notification.deal = event.address.toHexString();
    notification.event = notificationEvent.id;
    notification.to = who;
    notification.save();
  }

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

  if (event.params.state > 0) {
    let takerResult = dealContract.try_taker();
    if (!takerResult.reverted) {
      if (takerResult.value != event.params.sender) {
        notify(takerResult.value, event, notificationEvent);
      }
    }
  }
}

export function handleFeedbackGiven(event: FeedbackGiven): void {
  log.info("FeedbackGiven: deal={}, to={}, upvote={}, message={}", [
    event.address.toHexString(),
    event.params.to.toHexString(),
    event.params.upvote ? "true" : "false",
    event.params.message
  ]);
  let deal = fetchDeal(event.address)

  let dealContract = DealContract.bind(event.address)
  let offerResult = dealContract.try_offer()
  if (offerResult.reverted) return

  let offerContract = OfferContract.bind(offerResult.value)
  let ownerResult = offerContract.try_owner()
  if (ownerResult.reverted) return

  let takerResult = dealContract.try_taker()
  if (takerResult.reverted) return

  if (event.params.to == takerResult.value) {
    let fb = new Feedback(`${event.address.toHexString()}-taker`)
    fb.given = true
    fb.upvote = event.params.upvote
    fb.message = event.params.message
    fb.save()
    deal.feedbackForTaker = fb.id
  } else {
    let fb = new Feedback(`${event.address.toHexString()}-owner`)
    fb.given = true
    fb.upvote = event.params.upvote
    fb.message = event.params.message
    fb.save()
    deal.feedbackForOwner = fb.id
  }

  deal.save()
  doUpdateProfile(deal)
}
