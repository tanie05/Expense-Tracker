import React from 'react'
import Home from "./pages/Home.js"
import Login from './pages/Login'
import Register from "./pages/Register";
import List from "./pages/List"
import {UserContextProvider} from './UserContext'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function App() {
  

  return (
        <UserContextProvider>
        <Router>
          <Routes>
            <Route exact path="/" element={<Home/>} />
            <Route path="/view" element={<List/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
          </Routes>
        </Router>
        </UserContextProvider>
  )
}
