import {Await, useLoaderData} from "react-router-dom";
import {Button, Form, Input, List, Skeleton} from "antd";
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";

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
                <>
                <List size="small" bordered dataSource={messages} renderItem={(msg) => (
                    <List.Item>
                        {msg[0] === deal[2] ? 'Seller' : msg[0] === deal[1] ? 'Buyer' : 'Mediator'}
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
                </>
                )}
            </Await>
        </React.Suspense>
    );
}
