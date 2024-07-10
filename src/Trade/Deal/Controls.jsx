import React, {useContext} from "react";
import {DealContext} from "@/Trade/Deal/Deal.jsx";
import {useWalletProvider} from "@/hooks/useWalletProvider";
import {message, Space, Statistic} from "antd";
import {ethers} from "ethers";
import LoadingButton from "@/components/LoadingButton.jsx";
import {useContract} from "@/hooks/useContract.jsx";
import Feedback from "@/Trade/Deal/Feedback.jsx";

export default function Controls() {
    const {deal, setDeal} = useContext(DealContext);
    const { account } = useWalletProvider();
    const {token, market, signed} = useContract();

    async function call(methodName) {
        const contract = await signed(deal.contract);
        try {
            const tx = await contract[methodName]();
            return await tx.wait();
        } catch (e) {
            let parsed = deal.contract.interface.parseError(e.data);
            if (!parsed) parsed = token.interface.parseError(e.data)
            if (parsed) message.error(parsed.name)
            if (parsed.name === 'ERC20InsufficientBalance') {
                message.error(`Not enough ${deal.token.symbol}. You have ${parsed.args[1]}`);
            }
            throw e;
        }
    }
    function release() {
        call('release').then(() => {
            setDeal(deal.clone({state: 7}));
            message.success('Released');
        });
    }
    function paid() {
        call('paid').then(() => {
            setDeal(deal.clone({state: 3}));
            message.success('Paid');
        })
    }
    function cancel() {
        call('cancel').then(() => {
            setDeal(deal.clone({state: 5}));
            message.success('Cancelled');
        })
    }
    function dispute() {
        call('dispute').then(() => {
            setDeal(deal.clone({state: 4}));
            message.success('Disputed');
        });
    }

    async function accept() {
        if (deal.offer.isSell) {
            const t = await signed(token.attach(deal.token.contract.target));
            const allowance = await t.allowance(account, market.target);
            if (allowance < deal.tokenAmount) {
                await t.approve(market.target, ethers.MaxUint256);
            }
        }
        return call('accept').then(() => {
            setDeal(deal.clone({state: 2}));
            message.success('Accepted');
        });
    }

    if (deal.isParticipant(account)) {
        if (deal.offer.owner.toLowerCase() !== account.toLowerCase() && deal.state === 0 && deal.allowCancelUnpaidAfter < new Date()) {
            return <Space>Waiting for acceptance: <Statistic.Countdown value={deal.allowCancelUnacceptedAfter} /></Space>
        }
    }

    // FIXME taker / maker
    // for buyer
    if (account.toLowerCase() === deal.offer.owner.toLowerCase()) {
        return (
        <>
            <Space>
            {deal.state === 0 && account.toLowerCase() === deal.offer.owner.toLowerCase()
                && <LoadingButton type={"primary"} onClick={accept}>Accept</LoadingButton>}
            {deal.state === 2 && <LoadingButton type={"primary"} onClick={paid}>Paid</LoadingButton>}
            {deal.state <= 4  && <LoadingButton danger onClick={cancel}>Cancel</LoadingButton> }
            {deal.state === 4  && <LoadingButton danger onClick={dispute}>Dispute</LoadingButton> }
        </Space>
        {deal.state >= 6 && <Feedback />}
        </>);
    }

    // for seller
    if (account.toLowerCase() === deal.taker.toLowerCase()) {
        return (
        <>
            <Space>
            {deal.state === 0 && account.toLowerCase() === deal.offer.owner.toLowerCase()
                && <LoadingButton type={"primary"} onClick={accept}>Accept</LoadingButton>}
            {deal.state > 1 && deal.state < 5 && <LoadingButton type={"primary"} onClick={release}>Release</LoadingButton> }
            {deal.state === 0  && <LoadingButton danger onClick={cancel}>Cancel</LoadingButton> }
            {deal.state > 0 && deal.state < 3 && deal.allowCancelUnpaidAfter > new Date() && <LoadingButton danger onClick={cancel}>Cancel</LoadingButton> }
            {deal.state > 0 && deal.state < 3 && deal.allowCancelUnpaidAfter < new Date() && <Space>Cancel in <Statistic.Countdown value={deal.allowCancelUnpaidAfter} /></Space> }
            {deal.state === 4  && <LoadingButton danger onClick={dispute}>Dispute</LoadingButton> }
        </Space>
        {deal.state >= 6 && <Feedback />}
        </>
        );
    }
}
