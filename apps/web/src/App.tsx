import { createHashRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom'
import Layout from '@/layout'
import Home from '@/pages/Home/Home'
import Profile from '@/pages/Me/Profile'
import DealPage from '@/pages/Trade/Deal/Deal'
import UserDeals from '@/pages/Me/UserDeals'
import Offers from '@/pages/Trade/Offers/Offers'
import UserOffers from '@/pages/Me/Offers/UserOffers'
import OfferPage from '@/pages/Trade/Offer/Offer'
import OfferNew from '@/pages/Trade/Offer/OfferNew'

const router = createHashRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path={'/trade'}>
        <Route index element={<Navigate to={'/trade/sell'} />} />
        <Route path=":side/:token?/:fiat?/:method?" element={<Offers />} />
        <Route path={'offer/:offerId'} element={<OfferPage />} />
        <Route path={'offer/new'} element={<OfferNew />} />
        <Route path={'deal/:dealId'} element={<DealPage />} />
      </Route>
      <Route path={'/profile/:profile'} element={<Profile />} />
      <Route path={'/me'}>
        <Route index element={<Profile />} />
        <Route path={'offers'} element={<UserOffers />} />
        <Route path={'deals'} element={<UserDeals />} />
      </Route>
    </Route>
  )
)

const App = () => {
  return <RouterProvider router={router} />
}

export default App
