import useSWRMutation from 'swr/mutation'

export function useApi<T>(e: string, config?: RequestInit) {
  const { data, error, trigger, isMutating } = useSWRMutation(e, () =>
    fetch('https://api.github.com' + e, config).then((res) => res.json())
  )
  if (error) throw new Error(error.message)

  return {
    data: data as T,
    error,
    trigger,
    pending: isMutating,
  }
}
