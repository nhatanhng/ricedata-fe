import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

const loading = () => <div className="" />

const DefaultLayout = (props) => {
  return (
    <Suspense fallback={loading()}>
      <Outlet />
    </Suspense>
  )
}
export default DefaultLayout
