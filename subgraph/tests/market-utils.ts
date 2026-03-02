import { newMockEvent } from "matchstick-as/assembly/index"
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts"
import { OfferCreated, DealCreated } from "../generated/Market/Market"

export function createOfferCreatedEvent(
  owner: Address,
  token: Address,
  fiat: Bytes,
  offer: Address
): OfferCreated {
  let offerCreatedEvent = changetype<OfferCreated>(newMockEvent())

  offerCreatedEvent.parameters = new Array()

  offerCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  offerCreatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  offerCreatedEvent.parameters.push(
    new ethereum.EventParam("fiat", ethereum.Value.fromFixedBytes(fiat))
  )
  offerCreatedEvent.parameters.push(
    new ethereum.EventParam("offer", ethereum.Value.fromAddress(offer))
  )

  return offerCreatedEvent
}

export function createDealCreatedEvent(
  offerOwner: Address,
  taker: Address,
  offer: Address,
  deal: Address,
  method: Bytes,
  terms: string,
  paymentInstructions: string
): DealCreated {
  let dealCreatedEvent = changetype<DealCreated>(newMockEvent())

  dealCreatedEvent.parameters = new Array()

  dealCreatedEvent.parameters.push(
    new ethereum.EventParam("offerOwner", ethereum.Value.fromAddress(offerOwner))
  )
  dealCreatedEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )
  dealCreatedEvent.parameters.push(
    new ethereum.EventParam("offer", ethereum.Value.fromAddress(offer))
  )
  dealCreatedEvent.parameters.push(
    new ethereum.EventParam("deal", ethereum.Value.fromAddress(deal))
  )
  dealCreatedEvent.parameters.push(
    new ethereum.EventParam("method", ethereum.Value.fromFixedBytes(method))
  )
  dealCreatedEvent.parameters.push(
    new ethereum.EventParam("terms", ethereum.Value.fromString(terms))
  )
  dealCreatedEvent.parameters.push(
    new ethereum.EventParam("paymentInstructions", ethereum.Value.fromString(paymentInstructions))
  )

  return dealCreatedEvent
}
