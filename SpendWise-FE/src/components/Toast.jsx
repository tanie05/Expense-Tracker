import { useDispatch, useSelector } from 'react-redux'
import { removeToast, selectToasts } from '../store/slices/uiSlice'
import { useEffect } from 'react'

function ToastItem({ toast }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4000)
    return () => clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <div data-type={toast.type} onClick={() => dispatch(removeToast(toast.id))}>
      {toast.message}
    </div>
  )
}

export default function Toast() {
  const toasts = useSelector(selectToasts)

  if (!toasts.length) return null

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}
