import type { LiveState } from './useLiveSync'

export function LiveBadge({ live }: { live: LiveState }) {
  if (live.state === 'off') return null
  if (live.state === 'lost') {
    return (
      <span className="live-badge is-lost" role="status">
        Live sync stopped
      </span>
    )
  }
  const names = live.tools.map((t) => t.tool).join(', ')
  return (
    <span className="live-badge" role="status" title={live.tools.map((t) => `${t.tool}: ${t.detail}`).join('\n')}>
      <i aria-hidden /> Live{names ? `: ${names}` : ', waiting for an editor'}
    </span>
  )
}
