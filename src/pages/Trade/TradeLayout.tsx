import TokenNav from "./TokenNav";
import {Outlet} from "react-router-dom";

export default function TradeLayout() {
    return (
    <>
        <TokenNav />
        <Outlet />
    </>
    );
}
