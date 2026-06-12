import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { selectToken } from '../store/slices/authSlice'

export default function ProtectedRoute() {
  const token = useSelector(selectToken)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
