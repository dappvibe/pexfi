import {Profile as ProfileContract} from "../../../.cache/subgraph/generated/Market/Profile";
import {Address, BigInt} from "@graphprotocol/graph-ts";
import {Profile as ProfileEntity} from "../../../.cache/subgraph/generated/schema";

// lower than that will be drowned in the offers list
const PROFILE_GOODSTANDING_RATING = 75;
const PROFILE_GOODSTANDING_DEALS = 3;

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
                profile = new ProfileEntity(tokenId.toString())
            }
            let stats = profileContract.try_stats(tokenId)
            if (!stats.reverted) {
                profile.createdAt = stats.value.createdAt.toI32()
                profile.upvotes = stats.value.upvotes.toI32()
                profile.downvotes = stats.value.downvotes.toI32()
                let totalVotes = profile.upvotes + profile.downvotes;
                profile.rating = totalVotes ? profile.upvotes * 100 / totalVotes : 0;
                profile.volumeUSD = stats.value.volumeUSD.toI32()
                profile.avgPaymentTime = stats.value.avgPaymentTime.toI32()
                profile.avgReleaseTime = stats.value.avgReleaseTime.toI32()
                profile.dealsCompleted = stats.value.dealsCompleted.toI32()
                profile.dealsExpired = stats.value.dealsExpired.toI32()
                profile.disputesLost = stats.value.disputesLost.toI32()
                profile.goodstanding = profile.rating >= PROFILE_GOODSTANDING_RATING && profile.dealsCompleted >= PROFILE_GOODSTANDING_DEALS;
                profile.save()
                return profile;
            }
        }
    }
    return null;
}
