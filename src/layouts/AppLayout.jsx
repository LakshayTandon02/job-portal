import Header from '@/components/Header'
import React from 'react'
import { Outlet } from 'react-router-dom'
import './AppLayout.css' // 👈 Import your CSS file here

const AppLayout = () => {
  return (
    <div>
      <div className="grid-background"></div>
      <main className='main-container'>
        <Header />
        <Outlet />
      </main>
      <div className="footer">Built with ❤️ by Lakshay Tandon – Keep chasing your dreams!</div>
      </div>
  )
}

export default AppLayout
