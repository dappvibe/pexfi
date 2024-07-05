import {Button, Form, Input, message, Radio, Select, Skeleton, Space} from "antd";
import {Await, useLoaderData, useNavigate} from "react-router-dom";
import React from "react";
import {useWalletProvider} from "@/hooks/useWalletProvider";
import {ethers} from "ethers";

const { TextArea } = Input;

export default function OfferNew()
{
    const navigate = useNavigate();
    const { inventory } = useLoaderData();
    const { wallet } = useWalletProvider();
    const [lockSubmit, setLockSubmit] = React.useState(false);

    const [form] = Form.useForm();

    const required = [
        {required: true}
    ];

    async function submit(val) {
        setLockSubmit(true);

        //console.log(val)
        val.min = Math.floor(val.min)
        val.max = Math.ceil(val.max);
        val.rate = val.rate * 10**4;
        val.terms ??= '';
        //console.log(val)

        const provider = new ethers.BrowserProvider(wallet.provider);
        const m = await Market.connect(await provider.getSigner());
        m.createOffer(val)
            .then((tx) => {
                message.success('Offer submitted. You will be redirected shortly.');
                tx.wait().then((receipt) => {
                    receipt.logs.forEach(log => {
                        const OfferCreated = Market.interface.parseLog(log);
                        if (OfferCreated) {
                            message.success('Offer created');
                            const offer = OfferCreated.args[3];
                            console.log(offer)
                            navigate(`/trade/${offer[2] ? 'sell' : 'buy'}/${offer[3]}/${offer[4]}/${offer[5]}/${offer[0]}`);
                        }
                    });
                });
            }).
        finally(() => setLockSubmit(false));
    }

    return (
        <React.Suspense fallback={<Skeleton active />}>
            <Await resolve={inventory}>
                {([tokens, fiats, methods]) => (
                    <Form layout={"horizontal"} onFinish={submit}>
                        <Form.Item name="isSell" label={"I want to"} rules={required}>
                            <Radio.Group>
                                <Radio.Button value={false}>Buy</Radio.Button>
                                <Radio.Button value={true}>Sell</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item name="token" label={"Token"}  rules={required}>
                            <Select showSearch>
                                {Object.keys(tokens).map((key) => {
                                    const token = tokens[key];
                                    return <Select.Option key={token.address} value={token.symbol}>
                                        {token.symbol}
                                    </Select.Option>
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item name="fiat" label={"Fiat"} rules={required}>
                            <Select showSearch>
                                {fiats.map((symbol) => {
                                    return <Select.Option key={symbol} value={symbol}>
                                        {symbol}
                                    </Select.Option>
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item name="method" label={"Method"} rules={required}>
                            <Select showSearch placeholder={"Payment method"} >
                                {Object.keys(methods).map((key) => {
                                    const method = methods[key];
                                    return <Select.Option key={key} value={key}>
                                        {method.name}
                                    </Select.Option>
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item name="rate" label={"Rate"} rules={required}>
                            <Input />
                        </Form.Item>
                        <Space>
                            <Form.Item name="min" label="Min" rules={required}>
                                <Input />
                            </Form.Item>
                            <Form.Item name={"max"} label={"Max"}>
                                <Input />
                            </Form.Item>
                        </Space>
                        <Form.Item name="terms" label="Terms">
                            <TextArea rows={4} placeholder={"Written in blockchain. Keep it short."} />
                        </Form.Item>
                        <Form.Item>
                            <Button loading={lockSubmit} type="primary" htmlType="submit">Submit</Button>
                        </Form.Item>
                    </Form>
                )}
            </Await>
        </React.Suspense>
    );
}
