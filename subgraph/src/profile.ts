import {UpdatedInfo, Transfer, Profile as ProfileContract} from "../../.cache/subgraph/generated/Profile/Profile";
import {Address, BigInt, dataSource, log} from "@graphprotocol/graph-ts";
import {Profile as ProfileEntity} from "../../.cache/subgraph/generated/schema";

// lower than that will be drowned in the offers list
export const PROFILE_GOODSTANDING_RATING = 75;
export const PROFILE_GOODSTANDING_DEALS = 3;

export function updateRating(profile: ProfileEntity): void {
  let totalVotes = profile.upvotes + profile.downvotes;
  profile.rating = totalVotes ? profile.upvotes * 100 / totalVotes : 0;
  profile.goodstanding = profile.rating >= PROFILE_GOODSTANDING_RATING && profile.dealsCompleted >= PROFILE_GOODSTANDING_DEALS;
}

export function handleTransfer(event: Transfer): void {
  log.info("handleTransfer: tokenId={}, from={}, to={}", [event.params.tokenId.toString(), event.params.from.toHexString(), event.params.to.toHexString()]);

  let id = event.params.to.toHexString();
  let profile = ProfileEntity.load(id);
  if (!profile) {
    profile = new ProfileEntity(id);
    profile.tokenId = event.params.tokenId;
    profile.createdAt = event.block.timestamp.toI32();
    profile.rating = 0;
    profile.upvotes = 0;
    profile.downvotes = 0;
    profile.dealsCompleted = 0;
    profile.disputesLost = 0;
    profile.goodstanding = false;
  }
  profile.save();
}

export function handleUpdatedInfo(event: UpdatedInfo): void {
  log.info("handleUpdatedInfo: tokenId={}, info={}", [event.params.tokenId.toString(), event.params.info]);

  let profileContract = ProfileContract.bind(event.address);
  let ownerResult = profileContract.try_ownerOf(event.params.tokenId);
  if (!ownerResult.reverted) {
    let owner = ownerResult.value.toHexString();
    let profile = ProfileEntity.load(owner);
    if (profile) {
      profile.info = event.params.info;
      profile.save();
    } else {
      log.error("handleUpdatedInfo: Profile entity not found for owner={}", [owner]);
    }
  }
}

export function getRangingModifier(profile: ProfileEntity | null) : i32 {
    if (!profile) return 1;
    return profile.goodstanding ? 10000 : 1000 + profile.rating;
}

// Just a helper to find profile by owner
export function getProfile(owner: Address): ProfileEntity | null {
  return ProfileEntity.load(owner.toHexString());
}
