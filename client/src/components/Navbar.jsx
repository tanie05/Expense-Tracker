import React, { useContext, useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {UserContext} from '../UserContext'

export default function Navbar() {
  
  const navigate = useNavigate();
  const {value,setValue } = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);


  function handleClick(event) {
    event.preventDefault();
    setValue("")
    localStorage.clear();
    navigate('/login');
  }

  return (
    <div className='navbar'>
      <Link to="/" className='nav-elements'>Add new Transaction</Link>
      <Link to = "/view" className='nav-elements'>All Transactions</Link>
      
      {!value && <Link to="/login" className='nav-elements'>Login</Link>}
      {!value && <Link to="/register" className='nav-elements'>Register</Link>}
      {value && <Link onClick={handleClick} to="/" className='nav-elements'>Logout</Link>}
      
      
    </div>
  )
}
