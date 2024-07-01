import {Await, useLoaderData} from "react-router-dom";
import {Button, Col, Descriptions, Form, Input, List, Row, Skeleton, Steps} from "antd";
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";

function Progress(args) {
    const { deal } = args;

    let steps = [
        {
            title: 'Accepting',
            description: 'Counterparty confirms the deal',
            status: 'process'
        },
        {
            title: 'Funding',
            description: 'Crypto escrowed',
            status: 'wait'
        },
        {
            title: 'Paying',
            description: 'Buyer send fiat',
            status: 'wait'
        },
        {
            title: 'Releasing',
            description: 'Seller send crypto',
            status: 'wait'
        }
    ];
    if (deal.state >= 1) {
        steps[0] = {status: 'finish', title: 'Accepted'};
        steps[1] = {...steps[1], status: 'process'};
    }
    if (deal.state >= 2) {
        steps[1] = {status: 'finish', title: 'Funded'};
        steps[2] = {...steps[2], status: 'process'};
    }
    if (deal.state >= 3) {
        steps[2] = {status: 'finish', title: 'Paid'};
        steps[3] = {...steps[3], status: 'process'};
    }
    if (deal.state >= 8) {
        steps[3] = {status: 'finish', title: 'Released'};
    }

    return (
        <Steps items={steps} />
    );
}

function Info(args) {
    const deal = args.deal;

    console.log(deal)

    let key = 1;
    const items = [
        {key: key++, label: 'Seller', children: deal.seller},
        {key: key++, label: 'Buyer', children: deal.buyer},
        {key: key++, label: 'Crypto', children: deal.offer.token + ' ' + deal.tokenAmount},
        {key: key++, label: 'Fiat', children: deal.offer.fiat + ' ' + deal.fiatAmount.toFixed(2)},
        {key: key++, label: 'Price', children: (deal.fiatAmount / deal.tokenAmount).toFixed(3)},
        {key: key++, label: 'Method', children: deal.offer.method},
        {key: key++, label: 'Terms', children: deal.offer.terms || <i>No terms</i>},
        {key: key++, label: 'Payment instructions', children: deal.paymentInstructions}
    ];

    return (
        <Descriptions items={items} />
    );
}

export default function Deal() {
    let { contract, deal, logs } = useLoaderData();
    const [messages, setMessages] = useState([]);
    const [form] = Form.useForm();
    const [ lockSubmit, setLockSubmit ] = useState(false);

    const msg = {
        push: (log) => {
            setMessages((messages) => [...messages, log.args]);
        }
    };

    // strict mode causes useEffect to run twice in development
    let didInit = false;
    useEffect(() => {
        if (!didInit) {
            didInit = true;
            logs.then((logs) => logs.forEach(msg.push));
        }
    }, []);

    async function sendMessage(values) {
        setLockSubmit(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        provider.getSigner().then((signer) => {
            contract.connect(signer).message(values.message).then((tx) => {
                form.resetFields();
                setLockSubmit(false);
                tx.wait().then((receipt) => {
                    receipt.logs.forEach(msg.push);
                });
            });
        });
    }

    return (
    <React.Suspense fallback={<Skeleton active />}>
        <Await resolve={deal}>
        {(deal) => (
        <Row>
            <Col span={16}>
                <Progress deal={deal}/>
                <Await resolve={deal.offer}>
                    <Info deal={deal} />
                </Await>
            </Col>
            <Col span={8}>
            <List size="small" bordered dataSource={messages} renderItem={(msg) => (
                <List.Item>
                    {msg[0] === deal.seller ? 'Seller' : msg[0] === deal.buyer ? 'Buyer' : 'Mediator'}
                    {': '}
                    {msg[1]}
                </List.Item>
            )}>
            </List>
            <Form form={form} onFinish={sendMessage}>
                <Form.Item name="message">
                    <Input.TextArea placeholder={"Message"} rules={[{required: true, message: "Required"}]} />
                </Form.Item>
                <Form.Item>
                    <Button type={"primary"} htmlType={"submit"} loading={lockSubmit}>Send</Button>
                </Form.Item>
            </Form>
            </Col>
        </Row>
        )}
        </Await>
    </React.Suspense>
    );
}
