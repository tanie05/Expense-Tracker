import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendMessage, addUserMessage, selectMessages, selectChatStatus } from '../store/slices/chatSlice'
import { selectChatbotEnabled } from '../store/slices/authSlice'

export default function CalendarFilter() {
  const dispatch = useDispatch()
  



  

  return (
    <div>
      <form>
        <input type="date" />
        <input type="date" />
      </form>
    </div>
  )
}
