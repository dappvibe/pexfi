import {Await, useLoaderData} from "react-router-dom";
import {Button, Form, Input, Skeleton} from "antd";
import React from "react";

export default function Deal() {
    const { contract, deal } = useLoaderData();

    return (
        <React.Suspense fallback={<Skeleton active />}>
            <Await resolve={deal}>
                {(deal) => (
                <>
                <Form>
                    <Form.Item name={"message"}>
                        <Input.TextArea placeholder={"Message"} />
                    </Form.Item>
                    <Form.Item>
                        <Button type={"primary"}>Send</Button>
                    </Form.Item>
                </Form>
                </>
                )}
            </Await>
        </React.Suspense>
    );
}
