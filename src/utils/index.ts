export const formatChainAsNum = (chainIdHex: string) => {
    return parseInt(chainIdHex)
}

export const formatAddress = (addr: string) => {
    const upperAfterLastTwo = addr.slice(0,2) + addr.slice(2)
    return `${upperAfterLastTwo.substring(0, 7)}...${upperAfterLastTwo.substring(38)}`
}
