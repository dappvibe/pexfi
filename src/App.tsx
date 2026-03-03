import { createHashRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom'
import { Layout } from '@/features/layout'
import { OffersListPage, OfferViewPage, OfferNewPage, UserOffersPage } from '@/features/offers'
import Home from '@/pages/Home/Home'
import Profile from '@/pages/Me/Profile'
import DealPage from '@/pages/Trade/Deal/Deal'
import UserDeals from '@/pages/Me/UserDeals'

const router = createHashRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path={'/trade'}>
        <Route index element={<Navigate to={'/trade/sell'} />} />
        <Route path=":side/:token?/:fiat?/:method?" element={<OffersListPage />} />
        <Route path={'offer/:offerId'} element={<OfferViewPage />} />
        <Route path={'offer/new'} element={<OfferNewPage />} />
        <Route path={'deal/:dealId'} element={<DealPage />} />
      </Route>
      <Route path={'/profile/:profile'} element={<Profile />} />
      <Route path={'/me'}>
        <Route index element={<Profile />} />
        <Route path={'offers'} element={<UserOffersPage />} />
        <Route path={'deals'} element={<UserDeals />} />
      </Route>
    </Route>
  )
)

const App = () => {
  return <RouterProvider router={router} />
}

export default App
