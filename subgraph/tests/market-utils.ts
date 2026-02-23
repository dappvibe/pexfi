import { newMockEvent } from "matchstick-as/assembly/index"
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts"
import { OfferCreated } from "../generated/Market/Market"

export function createOfferCreatedEvent(
  owner: Address,
  token: Bytes,
  fiat: Bytes,
  offer: Address
): OfferCreated {
  let offerCreatedEvent = changetype<OfferCreated>(newMockEvent())

  offerCreatedEvent.parameters = new Array()

  offerCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  offerCreatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromFixedBytes(token))
  )
  offerCreatedEvent.parameters.push(
    new ethereum.EventParam("fiat", ethereum.Value.fromFixedBytes(fiat))
  )
  offerCreatedEvent.parameters.push(
    new ethereum.EventParam("offer", ethereum.Value.fromAddress(offer))
  )

  return offerCreatedEvent
}
