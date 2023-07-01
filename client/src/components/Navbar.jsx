import React, { useContext } from 'react'
import {Link} from 'react-router-dom'
import {UserContext} from '../UserContext'

export default function Navbar() {
  
  // const user = useContext(UserContext)
  const {value,setValue } = useContext(UserContext);


  function handleClick() {
    localStorage.clear()
    setValue("")
    window.location.reload(false)
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
