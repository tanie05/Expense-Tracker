import React, { useContext } from 'react'
import Navbar from '../components/Navbar'
import CreateTransaction from '../components/CreateTransaction'
import {UserContext} from "../UserContext"

export default function Home() {
  
  const { value, updateValue } = useContext(UserContext);

  const name = value? value : ""
  const message = `Welcome ${name}`
  
  return (
    <div>

      <Navbar/>
      <h2 className='history-heading welcome-msg'>{message}</h2>
      <CreateTransaction/>

    </div>
  )
}
