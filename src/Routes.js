import React from 'react'
import Login from "./Screens/Login";
import Home from './Screens/Home';
import Signup from "./Screens/SignUp";
import ProtectedRoute from './Screens/ProtectedRoute';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const RouterConfig = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/sign/up' element={<Signup/>} />
        <Route path='/home' element={<ProtectedRoute> <Home /></ProtectedRoute>} />
        <Route path = "*" element = {<Login/>} />
      </Routes>
    </Router>
  )
}

export default RouterConfig
