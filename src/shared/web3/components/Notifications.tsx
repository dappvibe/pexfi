import { useEffect } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useConnection } from 'wagmi'
import { Bell } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
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

export default function Notifications() {
  const { address } = useConnection()
  const { toast } = useToast()
  const { data, startPolling, stopPolling } = useQuery(GET_NOTIFICATIONS, {
    variables: { account: address },
    skip: !address,
    pollInterval: 30000,
  })

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && address) {
        startPolling(30000)
      } else {
        stopPolling()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    if (address && document.visibilityState === 'visible') {
      startPolling(30000)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stopPolling()
    }
  }, [address, startPolling, stopPolling])

  function buildMessage(entry: Notification): string {
    switch (entry.event.name) {
      case 'Message':
        return 'New Message'
      case 'DealState':
        switch (entry.event.arg0) {
          case '0': return 'New Deal'
          case '1': return 'Deal Accepted'
          case '2': return 'Deal Funded'
          case '3': return 'Deal Paid'
          case '4': return 'Deal Disputed'
          case '5': return 'Deal Canceled'
          case '6': return 'Dispute Resolved'
          case '7': return 'Deal Completed'
          default: return 'Deal Status Update'
        }
      default: return 'New Notification'
    }
  }

  useEffect(() => {
    const shownNotifications = JSON.parse(localStorage.getItem('shownNotifications') || '[]')

    if (data && data.notifications) {
      ;[...data.notifications].reverse().forEach((entry: Notification) => {
        if (!shownNotifications.includes(entry.id)) {
          toast({
            title: buildMessage(entry),
            description: (
              <Link to={`/trade/deal/${entry.deal.id}`} className="underline font-bold text-primary">
                View deal details
              </Link>
            ),
          })

          shownNotifications.push(entry.id)
          localStorage.setItem('shownNotifications', JSON.stringify(shownNotifications))
        }
      })
    }
  }, [data, toast])

  return (
    <div className="relative group">
      <Bell className="h-5 w-5 text-foreground/40 group-hover:text-primary transition-colors cursor-pointer" />
      {data?.notifications?.length > 0 && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      )}
    </div>
  )
}
