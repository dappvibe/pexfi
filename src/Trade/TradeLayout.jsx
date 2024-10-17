import TokenNav from "@/Trade/TokenNav.jsx";
import {Outlet} from "react-router-dom";

export default function TradeLayout() {
    return (
    <>
        <TokenNav />
        <Outlet />
    </>
    );
}
