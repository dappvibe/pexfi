import {useLoaderData} from "react-router-dom";
import {Col, Row, Skeleton} from "antd";
import React, {createContext, useEffect, useState} from "react";
import DealCard from "@/Trade/Deal/DealCard.jsx";
import MessageBox from "@/Trade/Deal/MessageBox.jsx";

export const DealContext = createContext({});

export default function Deal() {
    const { deal: promise } = useLoaderData();

    const [deal, setDeal] = useState();

    useEffect(() => {
        promise.then(setDeal);
    }, []);

    if (deal) {return (
        <DealContext.Provider value={{deal, setDeal}}>
            <Row gutter={5}>
                <Col span={16}>
                    <DealCard />
                </Col>
                <Col span={8}>
                    <MessageBox />
                </Col>
            </Row>
        </DealContext.Provider>
    )}
    else return (<Skeleton active />);
}
