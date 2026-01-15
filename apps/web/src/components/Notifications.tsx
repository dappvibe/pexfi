import React, { useEffect, useMemo } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { notification } from 'antd'
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'

type NotificationEvent = {
  id: string
  name: string
  arg0?: string
  arg1?: string
  arg2?: string
  arg3?: string
}

type Notification = {
  id: string
  createdAt: number
  to: string
  deal: {
    id: string
  }
  event: NotificationEvent
}

const GET_NOTIFICATIONS = gql`
  query GetNotifications($account: Bytes!) {
    notifications(to: $account, first: 10) {
      id
      createdAt
      deal {
        id
      }
      event {
        name
        arg0
        arg1
        arg2
        arg3
      }
    }
  }
`

const Context = React.createContext({
  name: 'Default',
})

export default function Notifications() {
  const [api, contextHolder] = notification.useNotification({
    stack: false,
    showProgress: true,
    duration: 5,
    placement: 'topRight',
  })
  const { address } = useAccount()
  const { data, startPolling, stopPolling } = useQuery(GET_NOTIFICATIONS, {
    variables: { account: address },
    skip: !address,
    pollInterval: 5000, // Poll every 5 seconds
  })

  useEffect(() => {
    if (address) {
      startPolling(5000)
    } else {
      stopPolling()
    }
  }, [address, startPolling, stopPolling])

  function buildMessage(entry: Notification): string {
    switch (entry.event.name) {
      case 'Message':
        return 'New Message'
      case 'DealState':
        switch (entry.event.arg0) {
          case '0':
            return 'New Deal'
          case '1':
            return 'Deal Accepted'
          case '2':
            return 'Deal Funded'
          case '3':
            return 'Deal Paid'
          case '4':
            return 'Deal Disputed'
          case '5':
            return 'Deal Canceled'
          case '6':
            return 'Dispute Resolved'
          case '7':
            return 'Deal Completed'
        }
    }
  }

  useEffect(() => {
    const shownNotifications = JSON.parse(localStorage.getItem('shownNotifications') || '[]')

    if (data && data.notifications) {
      ;[...data.notifications].reverse().forEach((entry: Notification) => {
        if (!shownNotifications.includes(entry.id)) {
          api.info({
            key: entry.id,
            role: 'status',
            message: buildMessage(entry),
            description: <Link to={`/trade/deal/${entry.deal.id}`}>Go to deal</Link>,
          })

          shownNotifications.push(entry.id)
          localStorage.setItem('shownNotifications', JSON.stringify(shownNotifications))
        }
      })
    }
  }, [data])

  const contextValue = useMemo(
    () => ({
      name: 'Ant Design',
    }),
    []
  )

  return <Context.Provider value={contextValue}>{contextHolder}</Context.Provider>
}
