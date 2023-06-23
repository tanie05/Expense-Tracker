import React from 'react'
import TransactionList from '../components/TransactionList'
import Navbar from '../components/Navbar'
export default function list() {
  const user = localStorage.getItem("user")
  const message = user? `Transaction list for user ${user}` : `You are not logged in. `
  return (

    <div>
      <Navbar/>
      <TransactionList user = {user}/>
    </div>
      
    
  )
}
