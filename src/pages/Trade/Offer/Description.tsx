import Username from "components/Username";
import {Descriptions} from "antd";
import React from "react";

export default function Description({offer})
{
    return (<Descriptions items={[
        {
            label: 'Owner',
            children: <Username avatar address={offer.owner} />
        },
        {label: 'Price', children: offer.price},
        {label: 'Limits', children: `${offer.min} - ${offer.max}`},
        {label: 'Terms', children: offer.terms || <i>None</i>},
    ]}/>);
}
