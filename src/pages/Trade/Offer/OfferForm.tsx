import {Button, Card, Col, Form, Input, InputNumber, message, Radio, Row, Select, Skeleton, Space} from "antd";
import {useNavigate} from "react-router-dom";
import React, {useRef} from "react";
import {useContract} from "hooks/useContract";
import {useInventory} from "hooks/useInventory";
import * as Types from "types";

const { TextArea } = Input;

/**
 * @param offer     If given, we're editing certain fields of existing offer.
 */
export default function OfferForm({offer = null})
{
    const navigate = useNavigate();
    const {Market, OfferFactory, Offer, signed} = useContract();
    const [lockSubmit, setLockSubmit] = React.useState(false);
    const { tokens, fiats, methods } = useInventory();
    const marketPrice = useRef(null);
    const [form] = Form.useForm();

    if (fiats.length === 0) return <Skeleton active />;

    async function setRate(rate) {
        if (!offer) return;

        rate = Math.floor((1 + rate / 100) * 10**4);
        if (offer.rate * 10**4 == rate) return;

        const o = await signed(Offer.attach(offer.address)) as Types.Offer;
        const tx = await o.setRate(rate);
        tx.wait().then(() => {
            message.success('Updated');
            window.location.reload();
        });
    }

    async function setLimits(min: number, max: number) {
        if (!offer) return;
        min = Math.floor(min);
        max = Math.ceil(max);
        const o = await signed(Offer.attach(offer.address)) as Types.Offer;
        // @ts-ignore generated LimitsStruct is wrong, array works
        const tx = await o.setLimits([min, max]);
        tx.wait().then(() => {
            message.success('Updated');
            window.location.reload();
        });
    }

    async function setTerms(terms) {
        if (!offer) return;
        const o = await signed(Offer.attach(offer.address)) as Types.Offer;
        const tx = await o.setTerms(terms);
        tx.wait().then(() => {
            message.success('Updated');
            window.location.reload();
        });
    }

    async function disable(offer) {
        const o = await signed(Offer.attach(offer.address)) as Types.Offer;
        const tx = await o.setDisabled(!offer.disabled);
        tx.wait().then(() => {
            message.success('Updated');
            window.location.reload();
        });
    }

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
            // @ts-ignore
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

    async function fetchRate() {
        const token = form.getFieldValue('token');
        const fiat = form.getFieldValue('fiat');
        if (token && fiat) {
            // FIXME store market rate somewhere, not from current
            let price: number | string = Number(await Market.getPrice(token, fiat));
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
        else fetchRate();
    }

    const required = [ {required: true, message: 'required'} ];

    return (
        <Card title={offer ? 'Update offer' : 'Submit an offer'}>
            <Form form={form} layout={"horizontal"} onFinish={submit} colon={false} onLoad={offer ? fetchRate : undefined}>
                <Row><Col>
                    <Space wrap size={"middle"}>
                        <Form.Item name="isSell" label={"I want to"} rules={required} initialValue={offer ? offer.isSell : undefined}>
                            <Radio.Group disabled={!!offer}>
                                <Radio.Button value={false}>Buy</Radio.Button>
                                <Radio.Button value={true}>Sell</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item name="token" label={"token"}  rules={required} initialValue={offer ? offer.token : undefined}>
                            <Select showSearch style={{width: 85}} onChange={fetchRate} disabled={!!offer}>
                                {Object.keys(tokens).map((key) => {
                                    const token = tokens[key];
                                    return <Select.Option key={token.address} value={token.symbol}>
                                        {token.symbol}
                                    </Select.Option>
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item name="fiat" label={"for"} rules={required} initialValue={offer ? offer.fiat : undefined}>
                            <Select showSearch style={{width: 85}} onChange={fetchRate} disabled={!!offer}>
                                {fiats.map((symbol) => {
                                    return <Select.Option key={symbol} value={symbol}>
                                        {symbol}
                                    </Select.Option>
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item name="method" label={"using"} rules={required} initialValue={offer ? offer.method : undefined}>
                            <Select showSearch placeholder={"Payment method"} disabled={!!offer}>
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
                        <Form.Item name="rate" label={"Margin"} rules={required} initialValue={offer ? ((offer.rate - 1) * 100).toFixed(2) : undefined}>
                            <InputNumber style={{width: 120}}
                                         changeOnWheel step={'0.01'}
                                         addonAfter={'%'}
                                         onChange={previewPrice}
                            />
                        </Form.Item>
                        <Form.Item name={"preview"} initialValue={offer ? previewPrice() : undefined}>
                            <Input style={{width: 150}} prefix={'~'} suffix={form.getFieldValue('fiat')} disabled />
                        </Form.Item>
                        {offer && <Form.Item>
                            <Button onClick={() => setRate(form.getFieldValue('rate'))}>Update</Button>
                        </Form.Item>}
                    </Space>
                </Col></Row>
                <Row><Col>
                    <Space>
                        <Form.Item name="min" label="Limits" rules={required} initialValue={offer ? offer.min : undefined}>
                            <Input style={{width: 120}}/>
                        </Form.Item>
                        <Form.Item name={"max"} label={"-"} rules={required} initialValue={offer ? offer.max : undefined}>
                            <Input style={{width: 120}} />
                        </Form.Item>
                        {offer && <Form.Item>
                            <Button onClick={() => setLimits(form.getFieldValue('min'), form.getFieldValue('max'))}>Update</Button>
                        </Form.Item>}
                    </Space>
                </Col></Row>
                <Form.Item name="terms" label="Terms" initialValue={offer ? offer.terms : undefined}>
                    <TextArea rows={4} placeholder={"Written in blockchain. Keep it short."} />
                </Form.Item>
                {offer &&
                    <>
                    <Form.Item>
                    <Button onClick={() => setTerms(form.getFieldValue('terms'))}>Update</Button>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={() => disable(offer)}>{offer.disabled ? 'Enable' : 'Disable'}</Button>
                    </Form.Item>
                    </>
                }
                {!offer &&
                    <>
                    <Form.Item>
                        <Button loading={lockSubmit} type="primary" htmlType="submit">Submit</Button>
                    </Form.Item>
                    </>
                }
            </Form>
        </Card>
    );
}
