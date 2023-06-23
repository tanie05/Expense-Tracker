import React from 'react'
import '../style.css'
import axios from 'axios'
export default function Register() {

  const [user, setUser] = React.useState({username: "", email: "", password: ""})
  function handleNameChange(event){
    setUser(prevUser => {
        return {...prevUser, username: event.target.value }
    })
  }

  function handleEmailChange(event){
    setUser(prevUser => {
        return {...prevUser, email: event.target.value }
    })
  }

  function handlePasswordChange(event){
    setUser(prevUser => {
        return {...prevUser, password: event.target.value }
    })
  }
  function registerUser(event){
    event.preventDefault();
    axios.post('http://localhost:5000/auth/register', user)
      .then(res => {
        if(res.data.success === true){
        const value = res.data.user.username
        localStorage.setItem("user",value)
        window.location = "/"}
        else{
          alert(res.data.message)
          window.location = "/register"
        }
        }
        );
      
      
  }
  return (
    <form id="my-form" className="my-form" onSubmit={registerUser}>
            <h3 className="form-heading">Register: </h3>

            <input 
              className="form-items" 
              type="text" 
              placeholder="Username"
              onChange={(e) => handleNameChange(e)}
              value={user.username}
            />
            <br />
            <input 
              className="form-items" 
              type="text" 
              placeholder="Email"
              onChange={(e) => handleEmailChange(e)}
              value={user.email}
            />
            <br />
            <input 
              className="form-items" 
              type="password"  
              placeholder="Password" 
              onChange={(e) => handlePasswordChange(e)}
              value={user.password}
            />
            <br />

            <input type='submit' value="Register" className="form-items submit-btn"/>

            <div>Already a user?<a href='/login'>Login</a></div>
    </form>
  )
}