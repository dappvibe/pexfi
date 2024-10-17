import {Button, Card, Col, Form, Input, InputNumber, message, Radio, Row, Select, Skeleton, Space} from "antd";
import {Await, useNavigate, useOutletContext} from "react-router-dom";
import React, {Suspense, useRef} from "react";
import {useContract} from "@/hooks/useContract.jsx";
import {useInventory} from "@/hooks/useInventory.jsx";

const { TextArea } = Input;

export default function OfferNew()
{
    const navigate = useNavigate();
    const {Market, OfferFactory, signed} = useContract();
    const [lockSubmit, setLockSubmit] = React.useState(false);

    const { tokens, fiats, methods } = useInventory();

    async function submit(val) {
        // FIXME this causes rerender all form and selects flicker
        setLockSubmit(true);

        val.min = Math.floor(val.min)
        val.max = Math.ceil(val.max);
        val.rate = Math.floor((1 + val.rate / 100) * 10**4);
        val.terms ??= '';

        const params = [
            val.isSell, val.token, val.fiat, val.method, val.rate, [val.min, val.max], val.terms
        ];

        try {
            const factory = await signed(OfferFactory);
            const tx = await factory.create(...params);
            message.success('Offer submitted. You will be redirected shortly.');

            const receipt = await tx.wait();
            receipt.logs.forEach(log => {
                const OfferCreated = Market.interface.parseLog(log);
                if (OfferCreated) {
                    message.success('Offer created');
                    navigate(`/trade/offer/${OfferCreated.args[3]}`);
                }
            });
        }
        finally {
            setLockSubmit(false);
        }
    }

    const marketPrice = useRef();
    const [form] = Form.useForm();

    async function fetchRate() {
        const token = form.getFieldValue('token');
        const fiat = form.getFieldValue('fiat');
        if (token && fiat) {
            // FIXME store market rate somewhere, not from current
            let price = Number(await Market.getPrice(token, fiat));
            price = (price / 10**6).toFixed(2);
            marketPrice.current = price;
            previewPrice();
        }
    }
    async function previewPrice() {
        const ratio = form.getFieldValue('rate') ?? 0;
        if (marketPrice.current) {
            // adjust price by ratio which is unsigned percentage of margin from current rate
            const current = marketPrice.current * (1 + (ratio / 100));
            form.setFieldValue('preview', current.toFixed(2));
        }
    }

    const required = [ {required: true, message: 'required'} ];
    const resolved = Promise.all([tokens, fiats, methods]);

    return (
    <Suspense fallback={<Skeleton active />}><Await resolve={resolved}>
    {([tokens, fiats, methods]) => (
    <Card title={'Submit an offer'}>
        <Form form={form} layout={"horizontal"} onFinish={submit} colon={false}>
            <Row><Col>
            <Space wrap size={"middle"}>
                <Form.Item name="isSell" label={"I want to"} rules={required}>
                    <Radio.Group>
                        <Radio.Button value={false}>Buy</Radio.Button>
                        <Radio.Button value={true}>Sell</Radio.Button>
                    </Radio.Group>
                </Form.Item>
                <Form.Item name="token" label={"token"}  rules={required}>
                    <Select showSearch style={{width: 85}} onChange={fetchRate}>
                        {Object.keys(tokens).map((key) => {
                            const token = tokens[key];
                            return <Select.Option key={token.address} value={token.symbol}>
                                {token.symbol}
                            </Select.Option>
                        })}
                    </Select>
                </Form.Item>
                <Form.Item name="fiat" label={"for"} rules={required}>
                    <Select showSearch style={{width: 85}} onChange={fetchRate}>
                        {fiats.map((symbol) => {
                            return <Select.Option key={symbol} value={symbol}>
                                {symbol}
                            </Select.Option>
                        })}
                    </Select>
                </Form.Item>
                <Form.Item name="method" label={"using"} rules={required}>
                    <Select showSearch placeholder={"Payment method"} >
                        {Object.keys(methods).map((key) => {
                            const method = methods[key];
                            return <Select.Option key={key} value={key}>
                                {method.name}
                            </Select.Option>
                        })}
                    </Select>
                </Form.Item>
            </Space>
            </Col></Row>
            <Row><Col>
            <Space direction={"horizontal"}>
                <Form.Item name="rate" label={"Margin"} rules={required}>
                    <InputNumber style={{width: 120}}
                                 changeOnWheel step={'0.01'}
                                 addonAfter={'%'}
                                 onChange={previewPrice}
                    />
                </Form.Item>
                <Form.Item name={"preview"}>
                    <Input style={{width: 150}} prefix={'~'} suffix={form.getFieldValue('fiat')} disabled />
                </Form.Item>
            </Space>
            </Col></Row>
            <Row><Col>
            <Space>
            <Form.Item name="min" label="Limits" rules={required}>
                    <Input style={{width: 120}}/>
                </Form.Item>
                <Form.Item name={"max"} label={"-"} rules={required}>
                    <Input style={{width: 120}} />
                </Form.Item>
            </Space>
            </Col></Row>
            <Form.Item name="terms" label="Terms">
                <TextArea rows={4} placeholder={"Written in blockchain. Keep it short."} />
            </Form.Item>
            <Form.Item>
                <Button loading={lockSubmit} type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>
    </Card>
    )}
    </Await></Suspense>
    );
}
