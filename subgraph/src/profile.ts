import {Profile as ProfileContract, UpdatedInfo, Transfer} from "../../.cache/subgraph/generated/templates/Profile/Profile";
import {Address, BigInt, dataSource, log} from "@graphprotocol/graph-ts";
import {Profile as ProfileEntity} from "../../.cache/subgraph/generated/schema";

// lower than that will be drowned in the offers list
const PROFILE_GOODSTANDING_RATING = 75;
const PROFILE_GOODSTANDING_DEALS = 3;

export function handleTransfer(event: Transfer): void {
  log.info("handleTransfer: tokenId={}, from={}, to={}", [event.params.tokenId.toString(), event.params.from.toHexString(), event.params.to.toHexString()]);

  let profile = ProfileEntity.load(event.params.tokenId.toString());
  if (!profile) {
    profile = new ProfileEntity(event.params.tokenId.toString());
    profile.createdAt = event.block.timestamp.toI32();
    profile.rating = 0;
    profile.upvotes = 0;
    profile.downvotes = 0;
    profile.volumeUSD = 0;
    profile.dealsCompleted = 0;
    profile.dealsExpired = 0;
    profile.disputesLost = 0;
    profile.avgPaymentTime = 0;
    profile.avgReleaseTime = 0;
    profile.goodstanding = false;
  }
  profile.owner = event.params.to;
  profile.save();
}

export function handleUpdatedInfo(event: UpdatedInfo): void {
  let tokenId = dataSource.context().getString("tokenId");
  log.info("handleUpdatedInfo: tokenId={}, info={}", [tokenId, event.params.info]);

  let profile = ProfileEntity.load(tokenId);
  if (profile) {
    profile.info = event.params.info;
    profile.save();
  } else {
    log.error("handleUpdatedInfo: Profile entity not found for tokenId={}", [tokenId]);
  }
}

export function getRangingModifier(profile: ProfileEntity | null) : i32 {
    if (!profile) return 1;
    return profile.goodstanding ? 10000 : 1000 + profile.rating;
}

export function updateProfileFor(repTokenAddress: Address, ownerAddress: Address) : ProfileEntity | null {
    // Fetch tokenId from Profile contract using ownerToTokenId
    let profileContract = ProfileContract.bind(repTokenAddress)
    let tokenIdResult = profileContract.try_ownerToTokenId(ownerAddress)
    if (!tokenIdResult.reverted) {
        let tokenId = tokenIdResult.value
        if (tokenId != BigInt.fromI32(0)) {
            let profile = ProfileEntity.load(tokenId.toString())
            if (!profile) {
                // This shouldn't happen if Transfer event was indexed, but as a fallback:
                profile = new ProfileEntity(tokenId.toString())
                // We don't have block timestamp here easily without passing it, but let's assume 0 for fallback
                profile.createdAt = 0
                profile.goodstanding = false
            }
            profile.owner = ownerAddress;
            let stats = profileContract.try_stats(tokenId)
            if (!stats.reverted) {
                profile.upvotes = stats.value.value0.toI32()
                profile.downvotes = stats.value.value1.toI32()
                let totalVotes = profile.upvotes + profile.downvotes;
                profile.rating = totalVotes ? profile.upvotes * 100 / totalVotes : 0;
                profile.volumeUSD = stats.value.value2.toI32()
                profile.avgPaymentTime = stats.value.value3.toI32()
                profile.avgReleaseTime = stats.value.value4.toI32()
                profile.dealsCompleted = stats.value.value5.toI32()
                profile.dealsExpired = stats.value.value6.toI32()
                profile.disputesLost = stats.value.value7.toI32()
                profile.goodstanding = profile.rating >= PROFILE_GOODSTANDING_RATING && profile.dealsCompleted >= PROFILE_GOODSTANDING_DEALS;
                profile.save()
                return profile;
            }
        }
    }
    return null;
}
