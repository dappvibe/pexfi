import {useLoaderData, useNavigate} from "react-router-dom";
import {Button, Card, Form, Input, message, Skeleton, Space} from "antd";
import React, {useEffect, useRef, useState} from "react";
import {MarketContract, useContract} from "@/hooks/useContract.jsx";
import Subnav from "@/Trade/Offer/Subnav.jsx";
import Description from "@/Trade/Offer/Description.jsx";
import {useWalletProvider} from "@/hooks/useWalletProvider";
import {ethers} from "ethers";

export default function Offer() {
    const { offer: offerPromise } = useLoaderData();
    const navigate = useNavigate();
    const { market, token: tokenContract, dealFactory, signed } = useContract();
    const { wallet, account } = useWalletProvider();

    const [offer, setOffer] = useState();
    const [allowance, setAllowance] = useState(0);

    const token = useRef();

    useEffect(() => {
        offerPromise.then((offer) => {
            if (account && !offer.isSell) {
                market.token(offer.token).then(([address]) => {
                    token.current = tokenContract.attach(address);
                    token.current.allowance(account, MarketContract.target).then((res) => {
                        setAllowance(res)
                    });
                });
            }
            return offer;
        })
        .then(setOffer);
    }, [account]);

    async function approve()
    {
        if (allowance > 0 || offer.isSell) return Promise.resolve();

        const t = await signed(token.current)
        return t.approve(MarketContract.target, ethers.MaxUint256).then((tx) => {
            tx.wait().then(() => {
                token.current.allowance(account, MarketContract.target).then(setAllowance);
            });
        });
    }

    async function createDeal(offer, values) {
        setLockButton(true);
        await approve();

        const factory = await signed(dealFactory);
        const amount = BigInt(values['fiatAmount'] * 10**6);

        try {
            const tx = await factory.create(offer.address, amount, values['paymentInstructions'] ?? '');
            message.info('Deal submitted. You will be redirected shortly.');
            const receipt = await tx.wait();
            receipt.logs.forEach(log => {
                const DealCreated = market.interface.parseLog(log);
                if (DealCreated) {
                    navigate(`/trade/deal/${DealCreated.args[3]}`);
                }
            });
            setLockButton(false);
        }
        catch (e) {
            const error = token.current.interface.parseError(e.data);
            if (error.name === 'ERC20InsufficientBalance') {
                message.error(`Not enough ${offer.token}. You have ${error.args[1]}`);
            } else {
                message.error(e.shortMessage);
            }
        }
        setLockButton(false);
    }

    const [form] = Form.useForm();
    form.syncTokenAmount = (fiat) => {
        const value = fiat.length > 0 ? (fiat / offer.price).toFixed(8) : '';
        form.setFieldValue('tokenAmount', value);
    }
    form.syncFiatAmount = (token) => {
        const value = token.length > 0 ? (token * offer.price).toFixed(2) : '';
        form.setFieldValue('fiatAmount', value);
        form.validateFields(['fiatAmount']);
    }

    const [ lockButton, setLockButton ] = useState(false);
    let submit = <Button type={"primary"} htmlType="submit" loading={lockButton} disabled={!account}>Open Deal</Button>;
    if (offer && !offer.isSell) {
        if (!allowance) {
            submit = <Button type={"primary"} htmlType="submit" loading={lockButton} disabled={!account}>Approve {offer.token}</Button>;
        }
    }

    if (!offer) return (<Skeleton active />);
    return (
    <>
    <Subnav offer={offer} />

    <Card title={`You are ${offer.isSell ? 'buying' : 'selling'} ${offer.token} for ${offer.fiat} using ${offer.method}`}>
        <Description offer={offer} />

        <Form autoComplete={"off"} form={form}
              onFinish={(values) => createDeal(offer, values)}
        >
            <Space>
            <Form.Item name={"tokenAmount"}>
                <Input placeholder={"Crypto Amount"} suffix={offer.token}
                       onChange={(e) => form.syncFiatAmount(e.target.value)}
                />
            </Form.Item>
            <Form.Item name={"fiatAmount"} rules={[
                {required: true, message: "Required"},
                () => ({
                    validator(_, value) {
                        if (value < offer.min) {
                            return Promise.reject(`Min is ${offer.min} ${offer.fiat}`);
                        }
                        if (value > offer.max) {
                            return Promise.reject(`Max is ${offer.max} ${offer.fiat}`);
                        }
                        return Promise.resolve();
                    },
                }),
            ]}>
                <Input placeholder={"Fiat Amount"} suffix={offer.fiat}
                       onChange={(e) => form.syncTokenAmount(e.target.value)}
                />
            </Form.Item>
            </Space>
            <Form.Item name={"paymentInstructions"}>
                <Input.TextArea placeholder={"Payment instructions"}/>
            </Form.Item>
            <Form.Item>
                {submit}
            </Form.Item>
        </Form>
    </Card>
    </>
    );
}
