import {Button, Form, Input, List} from "antd";
import React, {useContext, useEffect, useState} from "react";
import {DealContext} from "@/Trade/Deal/Deal.jsx";
import {useForm} from "antd/lib/form/Form.js";
import {useContract} from "@/hooks/useContract.tsx";
import {useAccount} from "wagmi";

export default function MessageBox()
{
    const {deal} = useContext(DealContext);
    const [ lockSubmit, setLockSubmit ] = useState(false);
    const [messages, setMessages] = useState([]);
    const { address } = useAccount();
    const { signed } = useContract();
    const [form] = useForm();

    function push(log) {
        setMessages((messages) => [...messages, log.args]);
    }

    // display existing messages
    useEffect(() => {
        const parsed = deal.logs.map((l) => deal.contract.interface.parseLog(l));
        const msgs = parsed.filter((l) => l.name === 'Message');
        setMessages(msgs.map(msgLogs => msgLogs.args));
        return () => setMessages([]);
    }, []);

    function send(values) {
        setLockSubmit(true);
        signed(deal.contract)
            .then((contract) => contract.message(values.message))
            .then((tx) => {
                form.resetFields();
                tx.wait().then((receipt) => receipt.logs.forEach(push))
            })
            .finally(() => setLockSubmit(false))
        ;
    }

    if (address && deal.isParticipant(address)) {
        return (
            <>
            <List size="small" bordered dataSource={messages} renderItem={(msg) => (
                <List.Item>
                    <b>{msg[0] === deal.taker ? 'Taker' : msg[0] === deal.offer.owner ? 'Owner' : 'Mediator'}</b>
                    {': '}
                    {msg[1]}
                </List.Item>
            )} />
            <Form onFinish={send} form={form}>
                <Form.Item name="message" rules={[{required: true, message: "Required"}]}>
                    <Input.TextArea placeholder={"Message"} />
                </Form.Item>
                <Form.Item>
                    <Button type={"primary"} htmlType={"submit"} loading={lockSubmit}>Send</Button>
                </Form.Item>
            </Form>
            </>
        );
    }
    else return (<h1>Please login to your wallet.</h1>);
}
