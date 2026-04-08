import { useDeal } from '@/features/deals/hooks/useDeal.ts'
import { DealState } from '@/features/deals/hooks/useReadDeal'

export default function DealProgress() {
  const { deal } = useDeal()

  if (!deal) return null

  const steps = [
    { label: 'Initiated', state: DealState.Initiated },
    { label: 'Accepted', state: DealState.Accepted },
    { label: 'Funded', state: DealState.Funded },
    { label: 'Paid', state: DealState.Paid },
    { label: 'Resolved', state: [DealState.Resolved, DealState.Completed, DealState.Disputed] },
  ]

  const getCurrentStepIndex = () => {
    switch (deal.state) {
      case DealState.Initiated: return 0
      case DealState.Accepted: return 1
      case DealState.Funded: return 2
      case DealState.Paid: return 3
      case DealState.Resolved:
      case DealState.Completed:
      case DealState.Disputed: return 4
      case DealState.Canceled: return -1
      default: return 0
    }
  }

  const currentIndex = getCurrentStepIndex()

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Background Line */}
      <div style={{ position: 'absolute', top: '20px', left: 0, width: '100%', height: '2px', background: '#353437', zIndex: 0 }} />
      
      {/* Active Line */}
      {currentIndex > 0 && (
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: 0, 
          width: `${(currentIndex / (steps.length - 1)) * 100}%`, 
          height: '2px', 
          background: '#d0bcff', 
          zIndex: 0,
          transition: 'width 0.3s ease-in-out'
        }} />
      )}

      {steps.map((step, index) => {
        const isCompleted = currentIndex > index || (index === 4 && (deal.state === DealState.Completed || deal.state === DealState.Resolved))
        const isActive = currentIndex === index
        const isDisputed = index === 4 && deal.state === DealState.Disputed
        
        return (
          <div key={index} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: isActive ? '40px' : '32px',
              height: isActive ? '40px' : '32px',
              borderRadius: '50%',
              background: isCompleted || isActive ? '#d0bcff' : '#353437',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isCompleted || isActive ? '#3c0091' : '#cbc3d7',
              boxShadow: isActive ? '0 0 20px rgba(208, 188, 255, 0.6)' : 'none',
              border: isActive ? '4px solid rgba(208, 188, 255, 0.2)' : 'none',
              transition: 'all 0.3s'
            }}>
              {isCompleted ? (
                <span className="material-symbols-outlined" style={{ fontSize: '1rem', fontWeight: 700 }}>check</span>
              ) : isActive ? (
                <span className="material-symbols-outlined rotate-animation" style={{ fontSize: '1.25rem', fontWeight: 700 }}>sync</span>
              ) : isDisputed ? (
                <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#ffb4ab' }}>gavel</span>
              ) : (
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{index + 1}</span>
              )}
            </div>
            <span style={{ 
              fontSize: '0.625rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              color: isActive ? '#d0bcff' : isCompleted ? '#e5e1e4' : 'rgba(203, 195, 215, 0.5)'
            }}>
              {isDisputed ? 'Disputed' : step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
