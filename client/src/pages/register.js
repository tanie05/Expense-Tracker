import React, { useContext } from 'react'
import axios from 'axios'
import { UserContext } from '../UserContext'
import { Navigate, useNavigate } from 'react-router-dom'
import baseUrl from '../appConfig'
import '../style.css'

export default function Register() {

  const [user, setUser] = React.useState({username: "", email: "", password: ""})
  const [flag, setFlag] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { setValue } = useContext(UserContext);
  
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
  async function registerUser(event){
    event.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post(`${baseUrl}/auth/register`, user);
      if(res.data.success === true){
        setValue(user.username)
        localStorage.setItem('user', user.username);
        localStorage.setItem('token', res.data.token);
        setFlag(true)
      }
      else{
        alert(res.data.message)
        setLoading(false);
      }
    } catch(err) {
      alert(err.response?.data?.message || "Registration failed!");
      setLoading(false);
    }
  }
  if(flag){
    return (<Navigate to = {'/'} />)
  }
  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-title">💰 Expense Tracker</h1>
        <p className="auth-subtitle">Start managing your finances today</p>
      </div>
      <form id="my-form" className="my-form" onSubmit={registerUser}>
              <h3 className="form-heading">Create Your Account</h3>

              <input 
                className="form-items" 
                type="text" 
                placeholder="Username"
                onChange={(e) => handleNameChange(e)}
                value={user.username}
                required
                minLength={3}
              />
              <br />
              <input 
                className="form-items" 
                type="email" 
                placeholder="Email"
                onChange={(e) => handleEmailChange(e)}
                value={user.email}
                required
              />
              <br />
              <input 
                className="form-items" 
                type="password"  
                placeholder="Password" 
                onChange={(e) => handlePasswordChange(e)}
                value={user.password}
                required
                minLength={6}
              />
              <br />

              <button type='submit' className="form-items submit-btn" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>

              <div className="auth-link">Already a user? <a href='/login'>Login here</a></div>
      </form>
    </div>
  )
}