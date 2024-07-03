import {Await, Link, useLoaderData, useNavigate} from "react-router-dom";
import {Breadcrumb, Button, Descriptions, Form, Input, message, Skeleton} from "antd";
import React, {useState} from "react";

import {Market} from "../js/contracts.js";
import {useSDK} from "@metamask/sdk-react";
import {ethers} from "ethers";

export default function Offer() {
    const { data } = useLoaderData();
    const { sdk, connected, connecting, provider, chainId } = useSDK();
    const [ lockButton, setLockButton ] = useState(false);
    const navigate = useNavigate();

    function title(offer) {
        let formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: offer.fiat,
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        });

        return formatter.format(offer.price);
    }

    async function createDeal(offer, values) {
        setLockButton(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const market = await Market.connect(await provider.getSigner());
        market.createDeal(offer.id, values['fiatAmount'], values['paymentInstructions'] ?? '').then((tx) => {
            message.info('Deal submitted. You will be redirected shortly.');
            tx.wait().then((receipt) => {
                receipt.logs.forEach(log => {
                    const DealCreated = Market.interface.parseLog(log);
                    if (DealCreated) {
                        setLockButton(false);
                        navigate('/trade/deal/'+DealCreated.args[2]);
                    }
                });
            });
        });
    }

    return (
        <React.Suspense fallback={<Skeleton active />}>
            <Await resolve={data}>
                {(offer) => (
                <>
                <Breadcrumb items={[
                    {title: <Link to={`/trade/sell/${offer.token}/${offer.fiat}/${offer.method}`}>Back to offers</Link>}
                ]} />
                <Descriptions title={`Offer to ${offer.isSell ? 'Sell' : 'Buy'} ${offer.token} for ${offer.fiat}`}
                    items={[
                        {label: 'Owner', children: <a href={`https://arbiscan.io/address/${offer.owner}`} target={"_blank"}>{offer.owner}</a>},
                        {label: 'Token', children: offer.token},
                        {label: 'Fiat', children: offer.fiat},
                        {label: 'Price', children: offer.price},
                        {label: 'Limits', children: `${offer.min} - ${offer.max}`},
                        {label: 'Method', children: offer.method},
                        {label: 'Terms', children: offer.terms},
                    ]}
                />
                <Form autoComplete={"off"}
                      onFinish={(values) => createDeal(offer, values)}
                >
                    <Form.Item name={"tokenAmount"}>
                        <Input placeholder={"Crypto Amount"}/>
                    </Form.Item>
                    <Form.Item name={"fiatAmount"} rules={[{required: true, message: "Required"}]}>
                        <Input placeholder={"Fiat Amount"}/>
                    </Form.Item>
                    <Form.Item name={"paymentInstructions"}>
                        <Input.TextArea placeholder={"Payment instructions"}/>
                    </Form.Item>
                    <Form.Item>
                        <Button type={"primary"} htmlType="submit"
                            loading={lockButton}
                        >Submit</Button>
                    </Form.Item>
                </Form>
                </>
                )}
            </Await>
        </React.Suspense>
    );
}
