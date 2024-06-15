import React from 'react'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
// import { AllRoutes } from './routes'

import { Switch } from 'antd'
import { AllRoutes } from './Routes'


const App = () => {
  return (
    <BrowserRouter>
      <AllRoutes/>
    </BrowserRouter>
  )
}

export default App
