import React from "react"
import ReactDOM from 'react-dom/client';
import Home from "./pages/home"
import Login from './pages/login'
import Register from "./pages/register";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import List from "./pages/list"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

    <Router>
          <Routes>
            <Route exact path="/" element={<Home/>} />
            <Route path="/view" element={<List/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            
          </Routes>
    </Router>
    
  
  
);
