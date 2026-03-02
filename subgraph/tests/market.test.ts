import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  createMockedFunction
} from "matchstick-as/assembly/index"
import { Address, Bytes, ethereum, BigInt } from "@graphprotocol/graph-ts"
import { handleOfferCreated, handleDealCreated } from "../src/market"
import { createOfferCreatedEvent, createDealCreatedEvent } from "./market-utils"

describe("Describe entity assertions", () => {
  let owner = Address.fromString("0x0000000000000000000000000000000000000001")
  let taker = Address.fromString("0x0000000000000000000000000000000000000009")
  let token = Address.fromString("0x0000000000000000000000000000000000000003")
  let fiat = Bytes.fromHexString("0x5553440000000000000000000000000000000000000000000000000000000000") as Bytes // bytes32("USD")
  let offer = Address.fromString("0x0000000000000000000000000000000000000002")
  let deal = Address.fromString("0x0000000000000000000000000000000000000010")
  let market = Address.fromString("0x70E5370b8981Abc6e14C91F4AcE823954EFC8eA3")
  let finder = Address.fromString("0x0000000000000000000000000000000000000004")
  let profile = Address.fromString("0x0000000000000000000000000000000000000005")

  beforeAll(() => {
    // Mock Offer contract calls
    createMockedFunction(offer, "owner", "owner():(address)")
      .returns([ethereum.Value.fromAddress(owner)])
    createMockedFunction(offer, "isSell", "isSell():(bool)")
      .returns([ethereum.Value.fromBoolean(true)])
    createMockedFunction(offer, "token", "token():(address)")
      .returns([ethereum.Value.fromAddress(token)])
    createMockedFunction(offer, "fiat", "fiat():(bytes32)")
      .returns([ethereum.Value.fromFixedBytes(fiat)])
    createMockedFunction(offer, "methods", "methods():(uint256)")
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
    createMockedFunction(offer, "rate", "rate():(uint16)")
      .returns([ethereum.Value.fromI32(100)])
    createMockedFunction(offer, "limits", "limits():(uint32,uint32)")
      .returns([ethereum.Value.fromI32(10), ethereum.Value.fromI32(1000)])
    createMockedFunction(offer, "terms", "terms():(string)")
      .returns([ethereum.Value.fromString("My terms")])
    createMockedFunction(offer, "disabled", "disabled():(bool)")
      .returns([ethereum.Value.fromBoolean(false)])

    // Mock Deal contract calls
    createMockedFunction(deal, "state", "state():(uint8)")
      .returns([ethereum.Value.fromI32(0)]) // Initiated
    createMockedFunction(deal, "offer", "offer():(address)")
      .returns([ethereum.Value.fromAddress(offer)])
    createMockedFunction(deal, "taker", "taker():(address)")
      .returns([ethereum.Value.fromAddress(taker)])
    createMockedFunction(deal, "tokenAmount", "tokenAmount():(uint256)")
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000))])
    createMockedFunction(deal, "fiatAmount", "fiatAmount():(uint256)")
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))])
    createMockedFunction(deal, "allowCancelUnacceptedAfter", "allowCancelUnacceptedAfter():(uint256)")
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123456789))])
    createMockedFunction(deal, "allowCancelUnpaidAfter", "allowCancelUnpaidAfter():(uint256)")
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123456799))])

    // Mock Market calls
    createMockedFunction(market, "finder", "finder():(address)")
      .returns([ethereum.Value.fromAddress(finder)])

    // Mock Finder calls
    createMockedFunction(finder, "getImplementationAddress", "getImplementationAddress(bytes32):(address)")
      .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString("0x50726f66696c6500000000000000000000000000000000000000000000000000"))])
      .returns([ethereum.Value.fromAddress(profile)])

    // Mock Profile calls
    createMockedFunction(profile, "ownerToTokenId", "ownerToTokenId(address):(uint256)")
      .withArgs([ethereum.Value.fromAddress(owner)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
    createMockedFunction(profile, "ownerToTokenId", "ownerToTokenId(address):(uint256)")
      .withArgs([ethereum.Value.fromAddress(taker)])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])

    // Mock Token calls
    createMockedFunction(token, "symbol", "symbol():(string)")
      .returns([ethereum.Value.fromString("TKN")])
    createMockedFunction(token, "name", "name():(string)")
      .returns([ethereum.Value.fromString("Token Name")])
    createMockedFunction(token, "decimals", "decimals():(uint8)")
      .returns([ethereum.Value.fromI32(18)])

    let newOfferCreatedEvent = createOfferCreatedEvent(
      owner,
      token,
      fiat,
      offer
    )
    newOfferCreatedEvent.address = market
    handleOfferCreated(newOfferCreatedEvent)

    let method = Bytes.fromHexString("0x43617368") as Bytes // "Cash"
    let newDealCreatedEvent = createDealCreatedEvent(
      owner,
      taker,
      offer,
      deal,
      method,
      "Terms here",
      "Pay instructions"
    )
    newDealCreatedEvent.address = market
    handleDealCreated(newDealCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  test("Offer created and stored", () => {
    assert.entityCount("Offer", 1)
    assert.entityCount("Token", 1)

    assert.fieldEquals(
      "Offer",
      offer.toHexString(),
      "owner",
      owner.toHexString()
    )
  })

  test("Deal created and stored", () => {
    assert.entityCount("Deal", 1)
    assert.fieldEquals(
      "Deal",
      deal.toHexString(),
      "taker",
      taker.toHexString()
    )
    assert.fieldEquals(
      "Deal",
      deal.toHexString(),
      "method",
      "0x43617368"
    )
  })
})
