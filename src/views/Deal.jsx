import {Await, useLoaderData} from "react-router-dom";
import {Button, Col, Descriptions, Form, Input, List, message, Row, Skeleton, Steps} from "antd";
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import {Market} from "../js/contracts.js";
import {useWalletProvider} from "../hooks/useWalletProvider";
import LoadingButton from "../components/LoadingButton.jsx";

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
    if (deal.state >= 7) {
        steps[3] = {status: 'finish', title: 'Completed'};
    }

    // TODO better that this
    if (deal.state === 5) {
        steps = [{status: 'finish', 'title': 'Cancelled'}];
    }

    return (
        <Steps items={steps} />
    );
}

function Info(args) {
    const deal = args.deal;

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

function Controls(args) {
    const { selectedWallet: wallet, selectedAccount: account } = useWalletProvider();
    const [dealState, setDealState] = useState(args.deal.state);
    const deal = args.deal;

    useEffect(() => {
        const provider = new ethers.BrowserProvider(wallet.provider);
        provider.getSigner().then((signer) => deal.contract = deal.contract.connect(signer));
    }, [deal, wallet]);

    function release() {
        return deal.contract.release().then((tx) => {
            tx.wait().then((receipt) => {
                setDealState(7);
                message.success('Complete');
            });
        })
        .catch(e => {
            console.error(deal.contract.interface.parseError(e.data));
        });
    }

    function paid() {
        return deal.contract.paid().then((tx) => {
            tx.wait().then((receipt) => {
                setDealState(3)
                message.info('Paid');
            });
        })
        .catch(e => {
            console.error(deal.contract.interface.parseError(e.data));
        });
    }

    function cancel() {
        return deal.contract.cancel().then((tx) => {
            tx.wait().then((receipt) => {
                setDealState(5);
                message.info('Cancelled')
            });
        }).catch(e => {
            console.error(deal.contract.interface.parseError(e.data));
        });
    }

    function dispute() {
        return deal.contract.dispute().then((tx) => {
            tx.wait().then((receipt) => {
                setDealState(4);
                message.info('Disputeled')
            });
        }).catch(e => {
            console.error(deal.contract.interface.parseError(e.data));
        });
    }

    // TODO handle balances (approval must be done on offer creation)
    function accept() {
        const token = new ethers.Contract(
            deal.token,
            ['function allowance(address, address) view returns (uint256)',
                'function approve(address, uint256) returns (bool)'],
            deal.contract.runner
        );
        return token.allowance(account, Market.target).then(allowance => {
            if (Number(allowance) < deal.tokenAmount) {
                return token.approve(Market.target, ethers.MaxUint256);
            } else {
                return this;
            }
        }).then(() => {
            deal.contract.accept().then((tx) => {
                tx.wait().then((receipt) => {
                    setDealState(2);
                    message.info('Accepted')
                });
            }).catch(e => {
                console.error(deal.contract.interface.parseError(e.data));
                message.error(e.info.error.data.message);
            });
        });
    }

    // for buyer
    if (account.toLowerCase() === deal.buyer.toLowerCase()) {
        return (<>
        {dealState === 2 && <LoadingButton type={"primary"} onClick={paid}>Paid</LoadingButton>}
        {dealState <= 4  && <LoadingButton danger onClick={cancel}>Cancel</LoadingButton> }
        {dealState === 4  && <LoadingButton danger onClick={dispute}>Dispute</LoadingButton> }
        </>);
    }

    // for seller
    if (account.toLowerCase() === deal.seller.toLowerCase()) {
        return (<>
        {dealState === 0 && account.toLowerCase() === deal.offer.owner.toLowerCase()
            && <LoadingButton type={"primary"} onClick={accept}>Accept</LoadingButton>}
        {dealState >= 2 && dealState <= 5 && <LoadingButton type={"primary"} onClick={release}>Release</LoadingButton> }
        {dealState === 0  && <LoadingButton danger onClick={cancel}>Cancel</LoadingButton> }
        {dealState === 4  && <LoadingButton danger onClick={dispute}>Dispute</LoadingButton> }
        </>);
    }
}

function MessageBox(args) {
    const deal = args.deal;
    const [form] = Form.useForm();
    const [ lockSubmit, setLockSubmit ] = useState(false);
    const [messages, setMessages] = useState([]);

    function push(log) {
        setMessages((messages) => [...messages, log.args]);
    }

    // strict mode causes useEffect to run twice in development
    let didInit = false;
    useEffect(() => {
        if (!didInit) {
            didInit = true;
            deal.contract.queryFilter('Message').then((logs) => logs.forEach(push));
        }
    }, []);

    function send(values) {
        setLockSubmit(true);
        deal.contract.message(values.message).then((tx) => {
            form.resetFields();
            setLockSubmit(false);
            tx.wait().then((receipt) => receipt.logs.forEach(push));
        });
    }

    return (
        <>
        <List size="small" bordered dataSource={messages} renderItem={(msg) => (
            <List.Item>
                {msg[0] === deal.seller ? 'Seller' : msg[0] === deal.buyer ? 'Buyer' : 'Mediator'}
                {': '}
                {msg[1]}
            </List.Item>
        )}>
        </List>
        <Form form={form} onFinish={send}>
            <Form.Item name="message">
                <Input.TextArea placeholder={"Message"} rules={[{required: true, message: "Required"}]} />
            </Form.Item>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"} loading={lockSubmit}>Send</Button>
            </Form.Item>
        </Form>
        </>
    );
}

export default function Deal() {
    let { contract, deal, logs } = useLoaderData();
    const { selectedWallet: wallet, selectedAccount: account } = useWalletProvider();

    useEffect(() => {
        if (wallet) {
            const provider = new ethers.BrowserProvider(wallet.provider);
            provider.getSigner().then((signer) => deal.contract = deal.contract?.connect(signer));
        }
    }, [deal, wallet]);

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
                {account && <Controls deal={deal}/>}
            </Col>
            <Col span={8}>
                <MessageBox deal={deal} />
            </Col>
        </Row>
        )}
        </Await>
    </React.Suspense>
    );
}
