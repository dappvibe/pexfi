import {Await, Link, useLoaderData, useNavigate} from "react-router-dom";
import {Breadcrumb, Button, Card, Descriptions, Form, Input, message, Skeleton, Space} from "antd";
import React, {useEffect, useState} from "react";
import {useContract} from "@/hooks/useContract.jsx";
import Username from "@/components/Username.jsx";
import {KeyboardDoubleArrowLeftOutlined} from "@mui/icons-material";

export default function Offer() {
    const { offer } = useLoaderData();
    const navigate = useNavigate();
    const { market } = useContract();

    const [ lockButton, setLockButton ] = useState(false);

    const [resolved, setResolved] = useState(false);
    useEffect(() => {
        offer.then((offer) => setResolved(offer));
    }, [offer]);

    const [form] = Form.useForm();
    form.syncTokenAmount = (fiat) => {
        const value = fiat.length > 0 ? (fiat / resolved.price).toFixed(8) : '';
        form.setFieldValue('tokenAmount', value);
    }
    form.syncFiatAmount = (token) => {
        const value = token.length > 0 ? (token * resolved.price).toFixed(2) : '';
        form.setFieldValue('fiatAmount', value);
        form.validateFields(['fiatAmount']);
    }

    async function createDeal(offer, values) {
        setLockButton(true);
        const amount = BigInt(values['fiatAmount'] * 10**6);
        market.createDeal(offer.id, amount, values['paymentInstructions'] ?? '').then((tx) => {
            message.info('Deal submitted. You will be redirected shortly.');
            tx.wait().then((receipt) => {
                receipt.logs.forEach(log => {
                    const DealCreated = market.interface.parseLog(log);
                    if (DealCreated) {
                        setLockButton(false);
                        navigate('/trade/deal/'+DealCreated.args[3]);
                    }
                });
            });
        })
        .catch((e) => {
            message.error(e.shortMessage)
        });
    }

    return (
    <React.Suspense fallback={<Skeleton active />}><Await resolve={offer}>
    {(offer) => (
    <>
        <Breadcrumb style={{margin: '10px 20px'}} items={[
            {title: <Link to={`/trade/sell/${offer.token}/${offer.fiat}/${offer.method}`}>
                        <Space><KeyboardDoubleArrowLeftOutlined/>Back to offers</Space>
                    </Link>}
        ]} />

        <Card title={`You are ${offer.isSell ? 'buying' : 'selling'} ${offer.token} for ${offer.fiat} using ${offer.method}`}>
            <Descriptions items={[
                {
                    label: 'Owner',
                    children: <Username avatar address={offer.owner} />
                },
                {label: 'Price', children: offer.price},
                {label: 'Limits', children: `${offer.min} - ${offer.max}`},
                {label: 'Terms', children: offer.terms || <i>None</i>},
            ]}/>
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
                    <Button type={"primary"} htmlType="submit"
                        loading={lockButton}
                    >Submit</Button>
                </Form.Item>
            </Form>
        </Card>
    </>
    )}
    </Await></React.Suspense>
    );
}
