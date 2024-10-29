import {RepToken as RepTokenContract} from "../../generated/Market/RepToken";
import {Address, BigInt} from "@graphprotocol/graph-ts";
import {Profile as ProfileEntity} from "../../generated/schema";

export function updateProfileFor(repTokenAddress: Address, ownerAddress: Address) : ProfileEntity | null {
    // Fetch tokenId from RepToken contract using ownerToTokenId
    let repTokenContract = RepTokenContract.bind(repTokenAddress)
    let tokenIdResult = repTokenContract.try_ownerToTokenId(ownerAddress)
    if (!tokenIdResult.reverted) {
        let tokenId = tokenIdResult.value
        if (tokenId != BigInt.fromI32(0)) {
            let profile = new ProfileEntity(tokenId.toString())
            let stats = repTokenContract.try_stats(tokenId)
            if (!stats.reverted) {
                profile.createdAt = stats.value.value0.toI32()
                profile.upvotes = stats.value.value1.toI32()
                profile.downvotes = stats.value.value2.toI32()
                let totalVotes = profile.upvotes + profile.downvotes;
                profile.rating = totalVotes ? profile.upvotes / totalVotes * 100 : 0;
                profile.volumeUSD = stats.value.value3.toI32()
                profile.dealsCompleted = stats.value.value4.toI32()
                profile.dealsExpired = stats.value.value5.toI32()
                profile.disputesLost = stats.value.value6.toI32()
                profile.avgPaymentTime = stats.value.value7.toI32()
                profile.avgReleaseTime = stats.value.value8.toI32()
                profile.save()
                return profile;
            }
        }
    }
    return null;
}
