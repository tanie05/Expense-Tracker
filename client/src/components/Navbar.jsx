import React from 'react'
import {Link} from 'react-router-dom'

export default function navbar() {
  const user = localStorage.getItem("user");
  function handleClick() {
    localStorage.clear()
    window.location.reload(false)
  }
  return (
    <div className='navbar'>
      <Link to="/" className='nav-elements'>Add new Transaction</Link>
      <Link to = "/view" className='nav-elements'>All Transactions</Link>
      
      {!user && <Link to="/login" className='nav-elements'>Login</Link>}
      {!user && <Link to="/register" className='nav-elements'>Register</Link>}
      {user && <Link onClick={handleClick} to="/" className='nav-elements'>Logout</Link>}
      
      
    </div>
  )
}
