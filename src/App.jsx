import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Job from './pages/Job-listing'
import JobPage from './pages/Job'
import PostJob from './pages/PostJob'
import SavedJob from './pages/SavedJob'
import Myjobs from './pages/My-jobs'
import { ThemeProvider } from './components/theme-provider'
import './index.css'
import Protectedroute from './components/Protectedroute'
import JobListing from './pages/Job-listing'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      
      {
        path: "/onboarding",
        element: (
          <Protectedroute>
        <Onboarding />,
        </Protectedroute>
        ),
      },
      {
        path: '/jobs',
        element:(
          <Protectedroute>
         <JobListing />,
        </Protectedroute>
        ),
      },
      {
        path: '/job/:id', // updated for dynamic job ID
        element:  (
          <Protectedroute>
        <JobPage />,
        </Protectedroute>
        ),
      },
      {
        path: '/post-job',
        element: (

          <Protectedroute>
         
        <PostJob />,
        </Protectedroute>
        ),
      },
      {
        path: '/saved-jobs',
        element: (
          <Protectedroute>
        <SavedJob />,
        </Protectedroute>
        ),
      },
      {
        path: '/my-jobs',
        element: (
          <Protectedroute>
        <Myjobs />,
        </Protectedroute>
        ),
      },
      {
        path: '*',
        element: <div>404 | Page not found</div>
      },
    ],
  },
])

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey='vite-ui-theme'>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
