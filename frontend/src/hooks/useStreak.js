import { useState, useEffect } from 'react'
import { getDashboardStats } from '../api/api'

export function useStreak() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStreak(data?.streak?.current_streak || 0))
      .catch(() => setStreak(0))
  }, [])

  return streak
}