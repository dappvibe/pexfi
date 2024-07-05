import {Token} from "@/model/Token.js";
import {DealContract} from "@/hooks/useContract.jsx";

export class Deal {
    constructor(address) {
        this.contract = DealContract.attach(address);
    }

    clone(overrides = {}) {
        return Object.assign(new Deal(this.contract.target), {...this, ...overrides});
    }

    fetch() {
        return Promise.all([
            this.contract.buyer(),
            this.contract.seller(),
            this.contract.mediator(),
            this.contract.token(),
            this.contract.tokenAmount(),
            this.contract.fiatAmount(),
            this.contract.state(),
            this.contract.paymentInstructions(),
            this.contract.allowCancelUnacceptedAfter(),
        ])
        .then(([buyer, seller, mediator, token, tokenAmount, fiatAmount, state, paymentInstructions, allowCancelUnacceptedAfter]) => {
            this.buyer = buyer;
            this.seller = seller;
            this.mediator = mediator;
            this.token = token; // address
            this.tokenAmount = Number(tokenAmount);
            this.fiatAmount = Number(fiatAmount) / 10**6; // FIXME test with large input
            this.state = Number(state); // FIXME constants
            this.paymentInstructions = paymentInstructions;
            this.allowCancelUnacceptedAfter = Number(allowCancelUnacceptedAfter); // FIXME date
            return this;
        })
        .then(() => {
            return (new Token(this.token)).fetch().then(token => {
                this.token = token;
                this.tokenAmount /= 10**token.decimals;
                return this;
            });
        });
    }

    isParticipant(address) {
        return [this.buyer.toLowerCase(), this.seller.toLowerCase(), this.mediator.toLowerCase()]
            .includes(address.toLowerCase());
    }
}
