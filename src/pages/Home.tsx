import { useApi } from '@/composable/useApi'
import type { ListGithub, Repos } from '@/type/github'
import {
  Accordion,
  Avatar,
  Button,
  HStack,
  Input,
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'
import Counter from '@/components/Counter'

export default function Home() {
  const [value, setValue] = useState([''])
  const [search, setSearch] = useState('')
  const [showUserText, setShowUserText] = useState(false)
  const [repos, setRepos] = useState<Repos[]>([])

  const { trigger, data, pending } = useApi<ListGithub>(
    '/search/users?q=' + search
  )

  const {
    trigger: triggerRepos,
    data: reposItem,
    pending: pendingRepos,
  } = useApi<Repos[]>(`/users/${value[0]}/repos`)

  async function handleInputEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      await trigger()
      setShowUserText(true)
    }
  }

  useEffect(() => {
    if (search.length === 0) {
      setShowUserText(false)
      setRepos([])
    }
  }, [search])

  useEffect(() => {
    setRepos([])
    if (value[0]) {
      async function getRepos() {
        await triggerRepos()
        setRepos(reposItem)
      }
      getRepos()
      return
    }
  }, [value])

  const ErrorFallback: React.FC = () => (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
      }}
    >
      <h2>Oops! Something went wrong</h2>
      <p>
        We're sorry, but something unexpected happened. Please try refreshing
        the page.
      </p>
      <button onClick={() => window.location.reload()}>Refresh Page</button>
    </div>
  )

  const Loading = () => {
    return (
      <div className="w-full flex flex-wrap items-center justify-center gap-2.5 transition-all duration-500 ease-linear my-4">
        <div className="w-3 h-3 bg-black rounded-full animate-bounce-scale transition-all duration-500 ease-linear"></div>
        <div className="w-3 h-3 bg-black rounded-full animate-bounce-scale-delay-1 transition-all duration-500 ease-linear"></div>
        <div className="w-3 h-3 bg-black rounded-full animate-bounce-scale-delay-2 transition-all duration-500 ease-linear"></div>
      </div>
    )
  }

  return (
    <>
      <Input
        className="border border-slate-300 rounded-md p-3"
        placeholder="Search user github"
        variant="outline"
        onKeyDown={handleInputEnter}
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
      <Button
        onClick={() => trigger()}
        colorPalette={'orange'}
        value={'solid'}
        color={'white'}
        className="mt-4 bg-blue-500 hover:bg-blue-600 p-2 rounded w-full"
      >
        Search
      </Button>
      {showUserText && (
        <Text className="mt-2" textStyle="md">
          Show user for "{search}"
        </Text>
      )}
      {pending && <Loading />}
      {!pending && data?.items.length === 0 && (
        <div className="mt-4 border p-4 rounded shadow-md">
          <h3 className="text-2xl font-bold text-center">404 Not Found</h3>
          <p className="text-center">
            The page you are looking for was not found.
          </p>
        </div>
      )}
      {!pending && data?.items.length > 0 && (
        <div className="mt-5 border p-4 rounded shadow-md">
          <Accordion.Root
            value={value}
            onValueChange={(e) => {
              setValue(e.value)
            }}
            width={'100%'}
            collapsible
          >
            {data?.items.map((item, index) => (
              <Accordion.Item
                key={index + 'item'}
                value={item.login}
                className="mb-2 border-b border-slate-300"
              >
                <Accordion.ItemTrigger className="mb-3">
                  <Avatar.Root shape="rounded">
                    <Avatar.Image src={item.avatar_url} />
                    <Avatar.Fallback name={item.avatar_url} />
                  </Avatar.Root>
                  <HStack flex="1">{item.login} </HStack>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <Accordion.ItemBody>
                      {pendingRepos && <Loading />}
                      {repos?.map((repo, i) => {
                        return (
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            key={repo.id}
                            className="border border-slate-300 p-4 first:mt-0 mt-3 rounded shadow-md flex justify-between items-start hover:bg-slate-100 cursor-pointer"
                          >
                            <div>
                              <Text
                                textStyle="xl"
                                className="md:block hidden font-bold"
                              >
                                {repo.name}
                              </Text>
                              <Text
                                textStyle="lg"
                                className="md:hidden block font-bold"
                              >
                                {repo.name}
                              </Text>
                              <Text textStyle="md">{repo.description}</Text>
                            </div>
                            <div className="flex items-center gap-1">
                              <Counter
                                number={repo.stargazers_count}
                                delay={i * 100}
                              />
                              <Star className="text-black" fill="#000" />
                            </div>
                          </a>
                        )
                      })}
                    </Accordion.ItemBody>
                  </ErrorBoundary>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      )}
    </>
  )
}
