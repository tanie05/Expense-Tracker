import React, { useContext, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../UserContext'
import { Navigate, useNavigate } from 'react-router-dom'
import baseUrl from '../appConfig'

export default function Login() {

  const { setValue } = useContext(UserContext);
  const [redirect,setRedirect] = useState(false);
  const [name,setName] = useState("")
  const [pw,setPw] = useState("")
  const [loading, setLoading] = useState(false);

  async function loginUser(event){
    
    event.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${baseUrl}/auth/login`, {"username" : name, "password" : pw});
      if(res.data.success === true){
        setValue(name)
        localStorage.setItem('user', name);
        localStorage.setItem('token', res.data.token);
        setRedirect(true)
      }
      else{
        alert(res.data.message)
        setLoading(false);
      }
    } catch(err) {
      alert(err.response?.data?.message || "Login failed")
      setLoading(false);
    }
  }
  if(redirect) {
    return <Navigate to={'/'} />
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-title">💰 Expense Tracker</h1>
        <p className="auth-subtitle">Manage your finances with ease</p>
      </div>
      <form id="my-form" className="my-form" onSubmit={loginUser}>
              <h3 className="form-heading">Welcome Back!</h3>

              <input 
                className="form-items" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Username'
                required
              />
              <br />

              <input 
              className="form-items" 
              type="password"  
              placeholder="Password" 
              value={pw}
              onChange={(e) => setPw(e.target.value)} 
              required
              />
              <br />

              <button className="form-items submit-btn" type='submit' disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
              <div className="auth-link">Don't have an account? <a href='/register'>Register here</a></div>
      </form>
    </div>
  )
}