import {Button, Form, Input, List} from "antd";
import React, {useEffect, useState} from "react";
import {useDealContext} from "./Deal.jsx";
import {useForm} from "antd/lib/form/Form.js";
import {useContract} from "hooks/useContract.tsx";
import {useAccount} from "wagmi";

export default function MessageBox()
{
    const {deal, refetch} = useDealContext();
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
        //setMessages(deal.messages.map(msgLogs => msgLogs.args));
        return () => setMessages([]);
    }, [deal]);

    function send(values) {
        setLockSubmit(true);
        signed(deal.contract)
            .then((contract) => contract.message(values.message))
            .then((tx) => {
                form.resetFields();
                tx.wait().then(() => refetch())
            })
            .finally(() => setLockSubmit(false))
        ;
    }

    function isParticipant(deal, address) {
        return [deal.taker.toLowerCase(), deal.offer.owner.toLowerCase()]
            .includes(address.toLowerCase());
    }

    if (address && isParticipant(deal, address)) {
        return (
            <>
            <List size="small" bordered dataSource={deal.messages} renderItem={(msg) => (
                <List.Item>
                    <b>{msg.sender === deal.taker ? 'Taker' : msg.sender === deal.offer.owner ? 'Owner' : 'Mediator'}</b>
                    {': '}
                    {msg.message}
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
