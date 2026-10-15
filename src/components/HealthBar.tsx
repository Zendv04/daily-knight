type Props = {
  label: string
  value: number
  max: number
  color: string
}

export default function HealthBar({ label, value, max, color }: Props) {
  const percent = max > 0 ? (value / max) * 100 : 0

  return (
    <div className="bar-wrap">
      <div className="bar-label">
        <span>{label}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="bar">
        <div
          className="bar-fill"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  )
}