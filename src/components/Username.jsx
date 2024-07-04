import PropTypes from "prop-types";
import ExplorerLink from "./ExplorerLink.jsx";
import {formatAddress} from "../utils.js";

export default function Username({address})
{
    return (
        <ExplorerLink address={address}>
            {formatAddress(address)}
        </ExplorerLink>
    );
}

Username.propTypes = {
    address: PropTypes.string.isRequired,
};
