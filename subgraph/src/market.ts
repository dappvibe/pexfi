import {
  DealCreated,
  FiatAdded,
  FiatRemoved,
  MethodAdded,
  MethodsDisabledMask,
  OfferCreated as OfferCreatedEvent,
  TokenAdded,
  TokenRemoved,
  Market as MarketContract
} from "../../.cache/subgraph/generated/Market/Market"
import {DataSourceContext, BigInt, Bytes, log} from "@graphprotocol/graph-ts"
import {Deal as DealTemplate, Offer as OfferTemplate} from "../../.cache/subgraph/generated/templates";
import {fetchAndSaveOffer} from "./offer";
import {fetchDeal} from "./deal";
import {Fiat, Method, Token} from "../../.cache/subgraph/generated/schema";
import {Token as TokenContract} from "../../.cache/subgraph/generated/Market/Token";

function bytesToString(bytes: Bytes): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) break;
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

export function handleTokenAdded(event: TokenAdded): void {
  log.info("TokenAdded: address={}", [event.params.address_.toHexString()]);
  let token = Token.load(event.params.address_.toHexString());
  if (!token) {
    token = new Token(event.params.address_.toHexString());
    token.address = event.params.address_;

    let tokenContract = TokenContract.bind(event.params.address_);
    let nameCall = tokenContract.try_name();
    if (!nameCall.reverted) {
      token.name = nameCall.value;
    } else {
      token.name = "Unknown";
    }

    let symbolCall = tokenContract.try_symbol();
    if (!symbolCall.reverted) {
      token.symbol = symbolCall.value;
    } else {
      token.symbol = "UNKNOWN";
    }

    let decimalsCall = tokenContract.try_decimals();
    if (!decimalsCall.reverted) {
      token.decimals = decimalsCall.value;
    } else {
      token.decimals = 18;
    }
  }

  let marketContract = MarketContract.bind(event.address);
  let tokenInfoCall = marketContract.try_tokens(event.params.address_);
  if (!tokenInfoCall.reverted) {
    token.pool = tokenInfoCall.value.getPool();
  }

  token.removed = false;
  token.save();
}

export function handleTokenRemoved(event: TokenRemoved): void {
  log.info("TokenRemoved: address={}", [event.params.address_.toHexString()]);
  let token = Token.load(event.params.address_.toHexString());
  if (token) {
    token.removed = true;
    token.save();
  }
}

export function handleFiatAdded(event: FiatAdded): void {
  log.info("FiatAdded: symbol={}, feed={}", [bytesToString(event.params.symbol), event.params.feed.toHexString()]);
  let fiat = Fiat.load(event.params.symbol.toHexString());
  if (!fiat) {
    fiat = new Fiat(event.params.symbol.toHexString());
  }
  fiat.symbol = bytesToString(event.params.symbol);
  fiat.feed = event.params.feed;
  fiat.removed = false;
  fiat.save();
}

export function handleFiatRemoved(event: FiatRemoved): void {
  log.info("FiatRemoved: symbol={}", [bytesToString(event.params.symbol)]);
  let fiat = Fiat.load(event.params.symbol.toHexString());
  if (fiat) {
    fiat.removed = true;
    fiat.save();
  }
}

export function handleMethodAdded(event: MethodAdded): void {
  log.info("MethodAdded: index={}, name={}", [event.params.index.toString(), bytesToString(event.params.name)]);
  let method = new Method(event.params.index.toString());
  method.name = bytesToString(event.params.name);
  method.index = event.params.index;
  method.disabled = false;
  method.save();
}

export function handleMethodsDisabledMask(event: MethodsDisabledMask): void {
  log.info("MethodsDisabledMask: mask={}", [event.params.mask.toString()]);
  let mask = event.params.mask;
  for (let i = 0; i < 256; i++) {
    let method = Method.load(i.toString());
    if (!method) break;
    
    let methodBit = BigInt.fromI32(1).leftShift(i as u8);
    method.disabled = !mask.bitAnd(methodBit).equals(BigInt.fromI32(0));
    method.save();
  }
}

export function handleOfferCreated(event: OfferCreatedEvent): void {
  log.info("OfferCreated: offer={}, owner={}, fiat={}, token={}", [
    event.params.offer.toHexString(),
    event.params.owner.toHexString(),
    bytesToString(event.params.fiat),
    event.params.token.toHexString()
  ]);
  // start indexing the offer and delegate first fetch
  let context = new DataSourceContext()
  context.setString('marketAddress', event.address.toHexString())
  OfferTemplate.createWithContext(event.params.offer, context);

  fetchAndSaveOffer(event.params.offer, event.address);
}

export function handleDealCreated(event: DealCreated): void {
  log.info("DealCreated: deal={}, offer={}, taker={}, owner={}, method={}, terms={}, payment={}", [
    event.params.deal.toHexString(),
    event.params.offer.toHexString(),
    event.params.taker.toHexString(),
    event.params.owner.toHexString(),
    event.params.method.toHexString(),
    event.params.terms,
    event.params.paymentInstructions
  ]);
  let deal = fetchDeal(event.params.deal);
  deal.createdAt = event.block.timestamp.toI32();
  deal.terms = event.params.terms;
  deal.paymentInstructions = event.params.paymentInstructions;
  deal.method = event.params.method;
  deal.save();

  // start listening to events from the new Deal contract
  let context = new DataSourceContext()
  context.setString('marketAddress', event.address.toHexString())
  DealTemplate.createWithContext(event.params.deal, context)
}
