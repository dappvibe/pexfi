import OfferForm from "pages/Trade/Offer/OfferForm";
import {Card} from "antd";

// This is here to allow OfferEdit with existing offer value. New offer has no existing values.
export default function OfferNew()
{
    return (
    <Card title={'Publish an Offer'}>
        <OfferForm />
    </Card>
    );
}
