import React  from 'react'
import { useState } from 'react'
import axios from 'axios';
export default function Login() {

  const [user, setUser] = useState({username: "", password: ""});

  function handleNameChange(event){
    setUser(prevUser => {
        return {...prevUser, username: event.target.value }
    })
  }
  function handlePasswordChange(event){
    setUser(prevUser => {
        return {...prevUser, password: event.target.value }
    })
  }
  function loginUser(event){
    event.preventDefault();
    axios.post('http://localhost:5000/auth/login', user)
      .then(res => {
        if(res.data.success === true){
        const value = res.data.user.username;
        localStorage.setItem("user",value)
        window.location = "/"
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

  return (
    <form id="my-form" className="my-form" onSubmit={loginUser}>
            <h3 className="form-heading">Login Details</h3>

            <input 
              className="form-items" 
              value={user.username}
              onChange={(e) => handleNameChange(e)}
              placeholder='Username'
            />
            <br />

            <input 
            className="form-items" 
            type="password"  
            placeholder="Password" 
            value={user.password}
            onChange={(e) => handlePasswordChange(e)} 
            />
            <br />

            <input className="form-items submit-btn" type='submit' value="Login" />
            <div><a href='/register'>Register</a></div>
    </form>
  )
}