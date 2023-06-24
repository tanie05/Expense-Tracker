import React, {useContext} from 'react'
import '../style.css'
import axios from 'axios'
import {UserContext, UserContextProvider} from '../UserContext'
import { Navigate } from 'react-router-dom'
export default function Register() {

  const [user, setUser] = React.useState({username: "", email: "", password: ""})
  const [flag, setFlag] = React.useState(false);
  const { value, setValue } = useContext(UserContext);
  
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
        
        const nameVal = res.data.user.username;
        const idVal = res.data.user._id;
        
        setValue(nameVal);
        setFlag(true)
      }
        else{
          alert(res.data.message)
          window.location = "/register"
        }
        }
        );
      
  }

  if(flag){
    <Navigate to = {'/'} />
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