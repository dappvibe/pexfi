import {useParams} from "react-router-dom";
import {Col, Row, Skeleton} from "antd";
import React, {createContext, useContext, useEffect, useState} from "react";
import DealCard from "./DealCard.jsx";
import MessageBox from "./MessageBox.jsx";
import {useAccount, useChainId} from "wagmi";
import {useContract} from "@/hooks/useContract.tsx";
import {Deal} from "@/model/Deal.js";
import {Token} from "@/model/Token.js";
import Offer from "@/model/Offer.js";

export type DealContextValue = {
    deal: Deal;
    setDeal: (deal: Deal) => void;
}
export const DealContext = createContext<DealContextValue>(null);
export const useDealContext = () => useContext(DealContext);

export default function DealPage() {
    const chainId = useChainId();
    const {address} = useAccount();
    const [deal, setDeal] = useState();
    const {Market, Offer: OfferContract, Token: TokenContract, Deal: DealContract} = useContract();
    const {dealId} = useParams();

    useEffect(() => {
        const contract = DealContract.attach(dealId);
        Promise.all([
            (new Deal(contract).fetch()),
            contract.queryFilter('*'),
        ])
        .then(([deal, logs]) => {
            deal.logs = logs;
            return deal;
        })
        .then(deal => {
            return Offer.fetch(OfferContract.attach(deal.offer)).then(o => {
                deal.offer = o;
                return deal;
            });
        })
        .then((deal) => {
            return Market.token(deal.offer.token).then(([address, symbol, name, decimals]) => {
                const token = new Token(TokenContract.attach(address));
                token.symbol = symbol;
                token.name = name;
                token.decimals = Number(decimals);
                deal.token = token;
                deal.tokenAmount /= (10 ** token.decimals);
                return deal;
            })
        })
        .then(setDeal);
    }, [address, chainId]);

    if (deal) {
        console.log(deal);
        return (
        <DealContext.Provider value={{deal, setDeal}}>
            <Row gutter={5}>
                <Col span={16}>
                    <DealCard />
                </Col>
                <Col span={8}>
                    <MessageBox />
                </Col>
            </Row>
        </DealContext.Provider>
    )}
    else return (<Skeleton active />);
}
