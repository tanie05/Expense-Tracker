import React, { useContext } from 'react'
import Home from "./pages/home.js"
import Login from './pages/login'
import Register from "./pages/register";
import List from "./pages/list"
import ChatWidget from './components/ChatWidget'
import {UserContextProvider, UserContext} from './UserContext'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Component to conditionally render ChatWidget based on authentication
function AppContent() {
  const { value } = useContext(UserContext);
  const token = localStorage.getItem('token');

  return (
    <>
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route path="/view" element={<List/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
      </Routes>
      {/* Only show chat widget when user is authenticated */}
      {value && token && <ChatWidget />}
    </>
  );
}

export default function App() {
  return (
    <UserContextProvider>
      <Router>
        <AppContent />
      </Router>
    </UserContextProvider>
  )
}
