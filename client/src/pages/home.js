import React from 'react'
import Navbar from '../components/Navbar'
import CreateTransaction from '../components/CreateTransaction'
export default function home() {
  const user = localStorage.getItem("user");

  const message = user? `Welcome ${user}` : `You are not logged in. `
  return (
    <div>

      <Navbar/>
      <h2 className='history-heading welcome-msg'>{message}</h2>
      <CreateTransaction user = {user}/>

    </div>
  )
}
