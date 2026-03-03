import { createHashRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom'
import { Layout } from '@/features/layout'
import { OffersListPage, OfferViewPage, OfferNewPage, UserOffersPage } from '@/features/offers'
import { DealViewPage, UserDealsPage } from '@/features/deals'
import Home from '@/pages/Home/Home'
import Profile from '@/pages/Me/Profile'

const router = createHashRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path={'/trade'}>
        <Route index element={<Navigate to={'/trade/sell'} />} />
        <Route path=":side/:token?/:fiat?/:method?" element={<OffersListPage />} />
        <Route path={'offer/:offerId'} element={<OfferViewPage />} />
        <Route path={'offer/new'} element={<OfferNewPage />} />
        <Route path={'deal/:dealId'} element={<DealViewPage />} />
      </Route>
      <Route path={'/profile/:profile'} element={<Profile />} />
      <Route path={'/me'}>
        <Route index element={<Profile />} />
        <Route path={'offers'} element={<UserOffersPage />} />
        <Route path={'deals'} element={<UserDealsPage />} />
      </Route>
    </Route>
  )
)

const App = () => {
  return <RouterProvider router={router} />
}

export default App
