import React, { useContext, useState } from 'react'
import {Link} from 'react-router-dom'
import {UserContext} from '../UserContext'
import { Navigate } from 'react-router-dom';

export default function Navbar() {
  

  const {value,setValue } = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);


  function handleClick() {
    localStorage.clear()
    setValue("")
    localStorage.clear();
    setRedirect(true)
  }
  if(redirect) {
    return <Navigate to={'/'} />
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
