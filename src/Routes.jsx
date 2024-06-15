import React, {Suspense} from 'react'
import { useRoutes } from 'react-router-dom'
// import DefaultLayout from './Layouts/DefaultLayout'
import UserLayout from './Layouts/UserLayout'



// const LoginPage = React.lazy(() => import('./Login'))
// const SignupPage = React.lazy(() => import('./Signup'))

const HomePage = React.lazy(() => import('./Home'))
const FilesPage = React.lazy(() => import('./UserPages/Files'))
  // const FilesPage = React.lazy(() => import('./UserPages/File1'))
const ImagesPage = React.lazy(() => import('./UserPages/Images'))
const StatisticsPage = React.lazy(() => import('./UserPages/Statistics'))
const AboutPage = React.lazy(() => import('./UserPages/About'))




const loading = () => <div className="" />

export const LoadComponent = ({ component: Component }) => (
    <Suspense fallback={loading()}>
      <Component />
    </Suspense>
)

const AllRoutes = () => {
  return useRoutes([
    // {
    //   element: <DefaultLayout />,
    //   children: [
    //     {
    //       path: '/',
    //       element: <LoadComponent component={LoginPage} />
    //     },
    //     {
    //       path: '/register',
    //       element: <LoadComponent component={SignupPage} />
    //     }
    //   ]
    // },
    {
      path: '/',
      element: <LoadComponent component={HomePage}/>
    },
    {
      element: <UserLayout/>,
      children: [
        {
          path: '/users/files',
          element: <LoadComponent component={FilesPage} />
        },
        {
          path: '/users/images',
          element: <LoadComponent component={ImagesPage} />
        },
        {
          path: '/users/statistics',
          element: <LoadComponent component={StatisticsPage} />
        },
        {
          path: '/users/about',
          element: <LoadComponent component={AboutPage} />
        },
      ]
    }
  ])
}

export { AllRoutes }




