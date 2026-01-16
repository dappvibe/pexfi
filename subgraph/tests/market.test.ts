import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { handleOfferCreated } from "../src/market"
import { createOfferCreatedEvent } from "./market-utils"

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let owner = Address.fromString("0x0000000000000000000000000000000000000001")
    let token = "ETH"
    let fiat = "USD"
    let offer = Address.fromString("0x0000000000000000000000000000000000000002")
    let newOfferCreatedEvent = createOfferCreatedEvent(
      owner,
      token,
      fiat,
      offer
    )
    handleOfferCreated(newOfferCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  test("Offer created and stored", () => {
    assert.entityCount("Offer", 1)

    assert.fieldEquals(
      "Offer",
      "0x0000000000000000000000000000000000000002",
      "owner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Offer",
      "0x0000000000000000000000000000000000000002",
      "token",
      "ETH"
    )
    assert.fieldEquals(
      "Offer",
      "0x0000000000000000000000000000000000000002",
      "fiat",
      "USD"
    )
  })
})
