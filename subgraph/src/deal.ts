import {Deal as DealContract, DealState as DealStateEvent, Message, FeedbackGiven, DisputeResolved} from "../../.cache/subgraph/generated/templates/Deal/Deal"
import {Deal as DealEntity, DealMessage, Feedback, Notification, NotificationEvent, Offer, Profile} from "../../.cache/subgraph/generated/schema"
import {Address, BigInt, Bytes, dataSource, log, crypto} from "@graphprotocol/graph-ts"
import {updateRating} from "./profile";

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

export function handleMessage(event: Message): void {
  log.info("Message: deal={}, sender={}", [
    event.address.toHexString(),
    event.params.sender.toHexString()
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
  let deal = fetchDeal(event.address)
  deal.save()

  // On RELEASED (Completed is state 7)
  if (event.params.state == 7) {
    let offer = Offer.load(deal.offer)
    if (offer) {
      let sellerProfile = Profile.load(offer.owner.toHexString())
      if (sellerProfile) {
        sellerProfile.dealsCompleted++
        updateRating(sellerProfile)
        sellerProfile.save()
      }
      let buyerProfile = Profile.load(deal.taker.toHexString())
      if (buyerProfile) {
        buyerProfile.dealsCompleted++
        updateRating(buyerProfile)
        buyerProfile.save()
      }
    }
  }

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
    let offerEntity = Offer.load(offerAddress.toHexString())
    if (offerEntity) {
      if (offerEntity.owner != event.params.sender) {
        notify(offerEntity.owner, event, notificationEvent);
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
  log.info("FeedbackGiven: deal={}, to={}, upvote={}", [
    event.address.toHexString(),
    event.params.to.toHexString(),
    event.params.upvote ? "true" : "false"
  ]);
  let deal = DealEntity.load(event.address.toHexString())
  if (!deal) return

  let offer = Offer.load(deal.offer)
  if (!offer) return

  let isToTaker = event.params.to.toHexString() == deal.taker.toHexString()
  let feedbackId = event.address.toHexString() + (isToTaker ? "-taker" : "-owner")
  
  // Check if already given (once only as per requirement)
  if (isToTaker) {
    if (deal.feedbackForTaker != null) return
  } else {
    if (deal.feedbackForOwner != null) return
  }

  let fb = new Feedback(feedbackId)
  fb.upvote = event.params.upvote
  fb.message = event.params.message
  fb.save()

  if (isToTaker) {
    deal.feedbackForTaker = fb.id
  } else {
    deal.feedbackForOwner = fb.id
  }
  deal.save()

  // Update profile counters
  let profile = Profile.load(event.params.to.toHexString())
  if (profile) {
    if (event.params.upvote) {
      profile.upvotes++
    } else {
      profile.downvotes++
    }
    updateRating(profile)
    profile.save()
  }
}

export function handleDisputeResolved(event: DisputeResolved): void {
  log.info("DisputeResolved: deal={}, resolution={}", [
    event.address.toHexString(),
    event.params.domainId.toHexString()
  ]);
  
  let deal = DealEntity.load(event.address.toHexString())
  if (!deal) return

  let offer = Offer.load(deal.offer)
  if (!offer) return

  // keccak256("PAID")
  let hashPaid = crypto.keccak256(Bytes.fromUTF8("PAID"));
  // keccak256("NOT PAID")
  let hashNotPaid = crypto.keccak256(Bytes.fromUTF8("NOT PAID"));
  
  let isNotPaid = event.params.domainId.toHexString() == hashNotPaid.toHexString();
  
  let buyer: Bytes;
  let seller: Bytes;
  
  if (offer.isSell) {
    buyer = deal.taker;
    seller = offer.owner;
  } else {
    buyer = offer.owner;
    seller = deal.taker;
  }
  
  let loserAddr = isNotPaid ? buyer : seller;
  let loserProfile = Profile.load(loserAddr.toHexString());
  if (loserProfile) {
    loserProfile.disputesLost++;
    loserProfile.save();
  }
}
