import TokenNav from "@/Trade/TokenNav.jsx";
import {Await, Outlet, useLoaderData} from "react-router-dom";
import {Suspense} from "react";
import {Skeleton} from "antd";

export default function TradeLayout() {
    const inventory = useLoaderData();

    return (
    <>
        <Suspense fallback={<Skeleton active paragraph={false}/> }>
            <Await resolve={inventory.tokens}>
                {(tokens) => <TokenNav tokens={tokens} />}
            </Await>
        </Suspense>
        <Outlet context={inventory} />
    </>
    );
}
