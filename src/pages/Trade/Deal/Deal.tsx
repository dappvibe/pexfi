import {useParams} from "react-router-dom";
import {Col, message, Row, Skeleton} from "antd";
import React, {createContext, useContext, useEffect, useState} from "react";
import DealCard from "./DealCard.jsx";
import MessageBox from "./MessageBox.jsx";
import {useChainId} from "wagmi";
import {Deal} from "@/model/Deal.js";
import {useDeal} from "../../../hooks/useDeal";
import {useContract} from "../../../hooks/useContract";

export type DealContextValue = {
    deal: Deal;
    setDeal: (deal: Deal) => void;
    refetch: () => void;
}
export const DealContext = createContext<DealContextValue>(null);
export const useDealContext = () => useContext(DealContext);

export default function DealPage() {
    const chainId = useChainId();
    const {dealId} = useParams();
    const {Deal} = useContract();

    // GraphQL query for deal data
    const reply = useDeal(dealId);
    useEffect(() => {
        if (reply.error) {
            console.error(reply.error.message);
            // noinspection JSIgnoredPromiseFromCall
            message.error('Failed to load offers');
        }
    }, [reply.error]);
    useEffect(() => {
        reply.refetch();
    }, [chainId]);

    // hydrate reply
    const [deal, setDeal] = useState<Deal>(null);
    useEffect(() => {
        if (!reply.deal) return;
        const deal = {...reply.deal};
        deal.contract = Deal.attach(deal.id);
        deal.state = Number(deal.state);
        deal.allowCancelUnacceptedAfter = new Date(Number(deal.allowCancelUnacceptedAfter) * 1000);
        deal.allowCancelUnpaidAfter = new Date(Number(deal.allowCancelUnpaidAfter) * 1000);
        deal.fiatAmount /= 10**6;
        deal.tokenAmount /= (10 ** deal.offer.token.decimals);
        setDeal(deal);
    }, [reply.deal]);

    // subscribe to updates


    if (!deal) return (<Skeleton active />);
    return (
    <DealContext.Provider value={{deal, setDeal: setDeal, refetch: reply.refetch}}>
        <Row gutter={5}>
            <Col span={16}>
                <DealCard />
            </Col>
            <Col span={8}>
                <MessageBox />
            </Col>
        </Row>
    </DealContext.Provider>
    );
}
