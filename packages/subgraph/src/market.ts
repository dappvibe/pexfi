import {DealCreated, OfferCreated as OfferCreatedEvent} from "../generated/Market/Market"
import {DataSourceContext} from "@graphprotocol/graph-ts"
import {Deal as DealTemplate, Offer as OfferTemplate} from "../generated/templates";
import {fetchAndSaveOffer} from "./offer";
import {fetchDeal} from "./deal";

export function handleOfferCreated(event: OfferCreatedEvent): void {
  // start indexind the offer and delegate first fetch
  let context = new DataSourceContext()
  context.setString('marketAddress', event.address.toHexString())
  OfferTemplate.createWithContext(event.params.offer, context);

  fetchAndSaveOffer(event.params.offer, event.address);
}

export function handleDealCreated(event: DealCreated): void {
  let deal = fetchDeal(event.params.deal);
  deal.createdAt = event.block.timestamp.toI32();
  deal.save();

  // start listening to events from the new Deal contract
  let context = new DataSourceContext()
  context.setString('marketAddress', event.address.toHexString())
  DealTemplate.createWithContext(event.params.deal, context)
}
