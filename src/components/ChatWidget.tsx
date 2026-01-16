import React, { useEffect } from 'react'
import * as process from 'node:process'

const ChatWidget: React.FC = () => {
  useEffect(() => {
    window.$crisp = []
    window.CRISP_WEBSITE_ID = import.meta.env.VITE_CRISP_ID
    ;(function () {
      const d = document
      const s = d.createElement('script')
      s.src = 'https://client.crisp.chat/l.js'
      s.async = true
      d.getElementsByTagName('head')[0].appendChild(s)
    })()
  }, [])

  return null
}

export default ChatWidget
