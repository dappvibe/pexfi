import {generatePath, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Input, message, Select, Skeleton, Space} from "antd";
import OffersTable from "./OffersTable";
import {useContract} from "@/hooks/useContract.jsx";
import {useChainId} from "wagmi";
import {useInventory} from "@/hooks/useInventory";
import {gql, useQuery} from "@apollo/client";

/**
 * The offers list must sort by price, but new profiles must be ranged below others.
 * However, Thegraph does not support multiple fields ordering.
 * Thus, three queries are made to get offers with goodstanding profiles first, then badstanding, and finally no profile.
 * Instead of simply sort by profile DESC, price.
 */
const GQL_OFFERS = gql`
query Offers($skip: Int, $where: Offer_filter, $orderDir: String) {
    offers(first: 20, skip: $skip, where: $where, orderBy: ranging, orderDirection: $orderDir) {
        id,
        owner,
        ranging,
        profile {
            id,
            dealsCompleted,
            rating
        },
        isSell,
        token, fiat, method,
        rate,
        minFiat, maxFiat,
        terms
    }
}`;

export default function Offers({offers: argOffers})
{
    const chainId = useChainId();
    const navigate = useNavigate();
    const {fiats, methods} = useInventory();
    const { Market } = useContract();

    let {
        side = 'sell',
        token = 'WBTC',
        fiat = 'USD',
        method = null
    } = useParams();

    // TODO user param of this function that shows certain owner's offers

    const where = {
        disabled: false,
        isSell: side === 'buy',
        token: token,
        fiat: fiat,
    }
    if (method) where['method'] = method;

    const { loading, error, data, refetch, fetchMore } = useQuery(GQL_OFFERS, {
        variables: {
            skip: 0,
            where: where,
            orderDir: side === 'buy' ? 'asc' : 'desc'
        },
    });

    const [totalOffers, setTotalOffers] = useState(null);
    useEffect(() => {
        setTotalOffers(null);
    }, [side, token, fiat, method]);

    function loadMore() {
        return fetchMore({
            variables: {
                skip: data.offers.length,
            },
            updateQuery: (prev, {fetchMoreResult}) => {
                if (fetchMoreResult.offers.length < 20) setTotalOffers(prev.offers.length + fetchMoreResult.offers.length); // fetched all
                return {offers: [...prev.offers, ...fetchMoreResult.offers]};
            }
        });
    }

    const [allOffers, setAllOffers] = useState(null); // data with market prices appended
    const [offers, setOffers] = useState(null); // filtered, shown in the table
    const [loading2, setLoading2] = useState(false);

    /**
     * Fetch market price of token in fiat and apply to offer rates.
     */
    useEffect(() => {
        if (!data) return;
        if (data.length === 0) { // skip fetching price
            setAllOffers([]);
            return;
        }

        setLoading2(true)
        Market.getPrice(token, fiat).then(price => {
            price = Number(price / 10000n) / 100;
            const offers = data.offers.map(offer => {
                const rate = Number(offer.rate) / 10**4;
                return {
                    ...offer,
                    rate: rate,
                    price: (price * rate).toFixed(2)
                }
            });
            setAllOffers(offers);
            setLoading2(false)
        })
    }, [data]);

    const [filterAmount, setFilterAmount] = useState('');

    // FIXME doesn't happed on change
    useEffect(() => {
        refetch();
    }, [chainId, refetch]);

    // filter by amount and set final offers
    useEffect(() => {
        if (allOffers) {
            if (filterAmount === '') {
                setOffers(allOffers);
            } else {
                setOffers(allOffers.filter(offer => offer.minFiat <= filterAmount && offer.maxFiat >= filterAmount));
            }
        }
    }, [filterAmount, allOffers]);

    useEffect(() => {
        if (error) {
            console.error(error.message);
            message.error('Failed to load offers');
        }
    }, [error]);

    return (<>
    <Space style={{margin: '10px 0 0 10px'}}>
        <Input placeholder={"Amount"}
               style={{maxWidth: 200}}
               allowClear
               onChange={(e) => setFilterAmount(e.target.value)}
               addonAfter={(
                   <Select placeholder="Search to Select"
                           showSearch
                           options={fiats.map(fiat => ({value: fiat}))}
                           defaultValue={fiat}
                           onChange={(fiat) => navigate(
                               generatePath('/trade/:side/:token/:fiat/:method?', {side, token, fiat, method}))}
                   />
               )}
        />
        <Select placeholder="Payment method"
            style={{width: 200}}
            allowClear
            showSearch
            defaultValue={method}
            options={Object.keys(methods).map(method => ({value: method}))}
            onChange={(method) => navigate(
                generatePath('/trade/:side/:token/:fiat/:method?', {side, token, fiat, method}))}
        />
    </Space>
    {offers === null ? <Skeleton active /> : <OffersTable offers={offers} loading={loading || loading2} loadMore={loadMore} totalOffers={totalOffers} />}
    </>);
}
