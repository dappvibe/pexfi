import React from "react";
import {useDealContext} from "./Deal.jsx";
import {message, Space, Statistic} from "antd";
import {ethers} from "ethers";
import LoadingButton from "components/LoadingButton.jsx";
import {useContract} from "hooks/useContract";
import Feedback from "./Feedback.jsx";
import {useAccount} from "wagmi";

export default function Controls() {
    const {deal} = useDealContext();
    const { address } = useAccount();
    const {Token, Market, signed} = useContract();

    if (!address) return;

    async function call(methodName: string) {
        const contract = await signed(deal.contract);
        try {
            const tx = await contract[methodName]();
            return await tx.wait();
        } catch (e) {
            let parsed = deal.contract.interface.parseError(e.data);
            if (!parsed) parsed = Token.interface.parseError(e.data)
            if (parsed) message.error(parsed.name)
            if (parsed.name === 'ERC20InsufficientBalance') {
                message.error(`Not enough ${deal.token.symbol}. You have ${parsed.args[1]}`);
            }
            throw e;
        }
    }

    async function release() {
        await call('release');
        message.success('Released');
    }

    async function paid() {
        await call('paid');
        message.success('Paid');
    }

    async function cancel() {
        await call('cancel');
        message.success('Cancelled');
    }

    async function dispute() {
        await call('dispute');
        message.success('Disputed');
    }

    async function accept() {
        if (deal.offer.isSell) {
            const t = await signed(Token.attach(deal.offer.token.address));
            const allowance = await t.allowance(address, Market.target);
            if (allowance < deal.tokenAmount) {
                await t.approve(Market.target, ethers.MaxUint256);
            }
        }
        return call('accept').then(() => {
            message.success('Accepted');
        });
    }

    function isOwner() {
        return address.toLowerCase() === deal.offer.owner.toLowerCase();
    }
    function isTaker() {
        return address.toLowerCase() === deal.taker.toLowerCase();
    }
    function isBuyer() {
        return (deal.offer.isSell && isTaker()) || (!deal.offer.isSell && isOwner());
    }
    function isSeller() {
        return (deal.offer.isSell && isOwner()) || (!deal.offer.isSell && isTaker());
    }

    const State = {
        Initiated: 0,
        Accepted: 1,
        Funded: 2,
        Paid: 3,
        Disputed: 4,
        Cancelled: 5,
        Resolved: 6,
        Completed: 7
    };
    const controls = [];
    // accept
    if (deal.state === State.Initiated && isOwner()) {
        controls.push(<LoadingButton type={"primary"} onClick={accept}>Accept</LoadingButton>);
    }

    // cancel
    switch (true) {
        case isOwner() && deal.state === State.Initiated:
        case isBuyer() && deal.allowCancelUnpaidAfter < new Date():
        case isBuyer() && deal.state > State.Initiated:
        case isSeller() && deal.state < State.Paid && deal.allowCancelUnpaidAfter < new Date():
            controls.push(<LoadingButton danger onClick={cancel}>Cancel</LoadingButton>);
            break;

        case isTaker() && deal.allowCancelUnacceptedAfter > new Date():
            controls.push(<span>Waiting for acceptance: <Statistic.Countdown value={deal.allowCancelUnacceptedAfter} /></span>);
            break;

        case isSeller() && deal.state < State.Paid && deal.allowCancelUnpaidAfter > new Date():
            controls.push(<span>Cancel in <Statistic.Countdown value={deal.allowCancelUnpaidAfter} /></span>);
            break;
    }

    // paid
    if (deal.state === State.Funded && isBuyer()) {
        controls.push(<LoadingButton type={"primary"} onClick={paid}>Paid</LoadingButton>);
    }

    // release
    if (deal.state > State.Funded && deal.state < State.Cancelled && isSeller()) {
        controls.push(<LoadingButton type={"primary"} onClick={release}>Release</LoadingButton>);
    }

    // dispute
    switch (true) {
        case deal.state >= State.Paid && deal.state < State.Disputed:
            controls.push(<LoadingButton danger onClick={dispute}>Dispute</LoadingButton>);
    }

    if (deal.state < State.Completed) {
        return (
        <Space>
            {controls.map((button, index) => (
                <React.Fragment key={index}>{button}</React.Fragment>
            ))}
        </Space>);
    } else {
        return (<Feedback />);
    }
}
