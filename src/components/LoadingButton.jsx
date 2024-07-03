import React, {useState} from "react";
import {Button} from "antd";

/**
 * Expects an onClick function that returns a promise.
 * Does not form for htmlType="submit" buttons because no onClick.
 *
 * @param args
 * @returns {Element}
 * @constructor
 */
export default function LoadingButton(args) {
    const { ...rest } = args;
    const [loading, setLoading] = useState(false);
    if (args.onClick) {
        rest.onClick = () => {
            setLoading(true);
            args.onClick().finally(() => setLoading(false));
        };
    }
    return <Button loading={loading} {...rest}>{args.children}</Button>;
}
