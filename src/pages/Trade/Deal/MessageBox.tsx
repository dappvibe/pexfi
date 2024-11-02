import {Button, Form, Input, List} from "antd";
import React, {useState} from "react";
import {useDealContext} from "./Deal.jsx";
import {useForm} from "antd/lib/form/Form.js";
import {useContract} from "hooks/useContract";
import {useAccount} from "wagmi";

export default function MessageBox()
{
    const {deal, refetch} = useDealContext();
    const [ lockSubmit, setLockSubmit ] = useState(false);
    const { address } = useAccount();
    const { signed } = useContract();
    const [form] = useForm();

    async function send(values) {
        setLockSubmit(true);
        try {
            const contract = await signed(deal.contract);
            return contract.message(values.message).then(() => form.resetFields());
        } finally {
            setLockSubmit(false);
        }
    }

    function isParticipant(deal, address) {
        return [deal.taker.toLowerCase(), deal.offer.owner.toLowerCase()]
            .includes(address.toLowerCase());
    }

    if (address && isParticipant(deal, address)) {
        const eq = (str1, str2) => str1.toLowerCase() === str2.toLowerCase();
        return (
            <>
            <List size="small" bordered dataSource={deal.messages} renderItem={(msg) => (
                <List.Item>
                    <b>{eq(msg.sender, deal.taker) ? 'Taker' : eq(msg.sender, deal.offer.owner) ? 'Owner' : 'Mediator'}</b>
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
