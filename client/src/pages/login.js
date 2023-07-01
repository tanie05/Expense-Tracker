import React, { useContext }  from 'react'
import { useState } from 'react'
import axios from 'axios';
import {UserContext} from '../UserContext'
import { Navigate } from 'react-router-dom';
import baseUrl from '../appConfig'

export default function Login() {

  const { setValue } = useContext(UserContext);
  const [redirect,setRedirect] = useState(false);
  const [name,setName] = useState("")
  const [pw,setPw] = useState("")

  function loginUser(event){
    
    event.preventDefault();

    axios.post(`${baseUrl}/auth/login`, {"username" : name, "password" : pw})
      .then(res => {
        if(res.data.success === true){
        setValue(name)
        localStorage.setItem('user', name);
        setRedirect(true)
      }
      else{
        alert(res.data.message)
        window.location = "/login"
      }
      }
      )
      .catch((err) => {
        alert(err)
        window.location = "/login"
      })
        
  }
  if(redirect) {
    return <Navigate to={'/'} />
  }

  return (
    <form id="my-form" className="my-form" onSubmit={loginUser}>
            <h3 className="form-heading">Login Details</h3>

            <input 
              className="form-items" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Username'
            />
            <br />

            <input 
            className="form-items" 
            type="password"  
            placeholder="Password" 
            value={pw}
            onChange={(e) => setPw(e.target.value)} 
            />
            <br />

            <input className="form-items submit-btn" type='submit' value="Login" />
            <div><a href='/register'>Register</a></div>
    </form>
  )
}