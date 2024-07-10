import {Token} from "@/model/Token.js";
import {DealContract, MarketContract} from "@/hooks/useContract.jsx";
import Offer from "@/model/Offer.js";

export class Deal {
    constructor(address) {
        this.contract = DealContract.attach(address);
    }

    clone(overrides = {}) {
        return Object.assign(new Deal(this.contract.target), {...this, ...overrides});
    }

    fetch() {
        return Promise.all([
            this.contract.offer(),
            this.contract.taker(),
            this.contract.tokenAmount(),
            this.contract.fiatAmount(),
            this.contract.state(),
            this.contract.paymentInstructions(),
            this.contract.allowCancelUnacceptedAfter(),
            this.contract.allowCancelUnpaidAfter(),
        ])
        .then(([offer, taker, tokenAmount, fiatAmount, state, paymentInstructions, allowCancelUnacceptedAfter, allowCancelUnpaidAfter]) => {
            this.taker = taker;
            this.tokenAmount = Number(tokenAmount);
            this.fiatAmount = Number(fiatAmount) / 10**6; // FIXME test with large input
            this.state = Number(state); // FIXME constants
            this.paymentInstructions = paymentInstructions;
            this.allowCancelUnacceptedAfter = new Date(Number(allowCancelUnacceptedAfter) * 1000);
            this.allowCancelUnpaidAfter = new Date(Number(allowCancelUnpaidAfter) * 1000);
            return Offer.fetch(offer).then(o => {
                this.offer = o;
                return this;
            });
        })
        .then(() => {
            return MarketContract.token(this.offer.token).then(([address, symbol, name, decimals]) => {
                const token = new Token(address);
                token.symbol = symbol;
                token.name = name;
                token.decimals = decimals;
                this.token = token;
                return this;
            })
        });
    }

    isParticipant(address) {
        // TODO mediator is not yet in deal contract
        return [this.taker.toLowerCase(), this.offer.owner.toLowerCase()]
            .includes(address.toLowerCase());
    }
}
