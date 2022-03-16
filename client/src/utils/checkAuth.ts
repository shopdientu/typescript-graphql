import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useMeQuery } from '../generated/graphql'

const checkPaths = ['/login', '/register', '/forgot-password', '/change-password']

export const checkAuth = () => {
  const router = useRouter()

  const { data, loading } = useMeQuery()
  useEffect(() => {
    if (!loading) {
      if (data?.me && checkPaths.includes(router.route)) {
        setTimeout(() => {
          router.replace('/')
        }, 1000)
      }
    } else if (!data?.me) {
      router.replace('/login')
    }
  }, [data, loading, router])

  return { data, loading }
}
