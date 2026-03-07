import {OfferUpdated} from "../../.cache/subgraph/generated/templates/Offer/Offer";
import {Offer as OfferEntity, Token} from "../../.cache/subgraph/generated/schema";
import {Offer as OfferContract} from "../../.cache/subgraph/generated/Market/Offer"
import {Token as TokenContract} from "../../.cache/subgraph/generated/Market/Token"
import {Address, BigInt, Bytes, dataSource} from '@graphprotocol/graph-ts';
import {Market as MarketContract} from "../../.cache/subgraph/generated/Market/Market";
import {Finder as FinderContract} from "../../.cache/subgraph/generated/Market/Finder";
import {getRangingModifier, updateProfileFor} from "./profile";

export function fetchToken(tokenAddress: Address): Token {
  let tokenId = tokenAddress.toHexString();
  let token = Token.load(tokenId);
  if (!token) {
    token = new Token(tokenId);
    token.address = tokenAddress;

    let tokenContract = TokenContract.bind(tokenAddress);

    let symbolResult = tokenContract.try_symbol();
    if (!symbolResult.reverted) {
      token.symbol = symbolResult.value;
    } else {
      token.symbol = "UNKNOWN";
    }

    let nameResult = tokenContract.try_name();
    if (!nameResult.reverted) {
      token.name = nameResult.value;
    } else {
      token.name = "Unknown Token";
    }

    let decimalsResult = tokenContract.try_decimals();
    if (!decimalsResult.reverted) {
      token.decimals = decimalsResult.value;
    } else {
      token.decimals = 18;
    }

    token.save();
  }
  return token;
}

export function fetchAndSaveOffer(target: Address, market: Address): OfferEntity {
  let offerContract = OfferContract.bind(target);
  let offer = new OfferEntity(target.toHex());

  let marketContract = MarketContract.bind(market);

  let ownerResult = offerContract.try_owner();
  if (!ownerResult.reverted) {
    offer.owner = ownerResult.value;
  }

  let isSellResult = offerContract.try_isSell();
  if (!isSellResult.reverted) {
    offer.isSell = isSellResult.value;
  }

  let tokenResult = offerContract.try_token();
  if (!tokenResult.reverted) {
    let token = fetchToken(tokenResult.value);
    offer.token = token.id;
  }

  let fiatResult = offerContract.try_fiat();
  if (!fiatResult.reverted) {
    offer.fiat = fiatResult.value;
  }

  let methodsResult = offerContract.try_methods();
  if (!methodsResult.reverted) {
    offer.methods = methodsResult.value;
  }

  let rateResult = offerContract.try_rate();
  if (!rateResult.reverted) {
    offer.rate = rateResult.value;
  }

  let limitsResult = offerContract.try_limits();
  if (!limitsResult.reverted) {
    offer.minFiat = limitsResult.value.getMin().toI32();
    offer.maxFiat = limitsResult.value.getMax().toI32();
  }

  let termsResult = offerContract.try_terms();
  if (!termsResult.reverted) {
    offer.terms = termsResult.value;
  }

  let disabledResult = offerContract.try_disabled();
  if (!disabledResult.reverted) {
    offer.disabled = disabledResult.value;
  }

  let finderResult = marketContract.try_finder();
  if (!finderResult.reverted) {
    let finderContract = FinderContract.bind(finderResult.value);
    let profileAddressResult = finderContract.try_getImplementationAddress(Bytes.fromHexString("0x50726f66696c6500000000000000000000000000000000000000000000000000") as Bytes);
    if (!profileAddressResult.reverted) {
      const profile = updateProfileFor(profileAddressResult.value, Address.fromBytes(offer.owner));
      offer.profile = profile ? profile.id : null;
      let modifier = BigInt.fromI32(getRangingModifier(profile));
      let rate = BigInt.fromI32(offer.rate);
      if (offer.isSell) {
        // ASC sorting, lowest first, so decrease goodstanding
        offer.ranging = rate.times(BigInt.fromI32(100)).div(modifier);
      } else {
        // DESC sorting, highest first so increase goodstanding
        offer.ranging = rate.times(modifier);
      }
    }
  }

  offer.save();
  return offer;
}

export function handleOfferUpdated(event: OfferUpdated): void {
  log.info("OfferUpdated: address={}", [event.address.toHexString()]);
  fetchAndSaveOffer(event.address, Address.fromString(dataSource.context().getString('marketAddress')))
}
