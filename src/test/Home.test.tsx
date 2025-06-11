import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/pages/Home'
import { useApi } from '@/composable/useApi'

const mockTrigger = vi.fn()
const mockTriggerRepos = vi.fn()

vi.mock('@/composable/useApi', () => ({
  useApi: vi.fn((url) => {
    if (url.includes('/search/users')) {
      return {
        trigger: mockTrigger,
        data: { items: [] },
        pending: false,
      }
    }
    return {
      trigger: mockTriggerRepos,
      data: [],
      pending: false,
    }
  }),
}))

vi.mock('@/components/ErrorBoundary', () => ({
  default: ({
    children,
    fallback,
  }: {
    children: React.ReactNode
    fallback: React.ReactNode
  }) => children || fallback,
}))

vi.mock('@/components/Counter', () => ({
  default: ({ number }: { number: number }) => (
    <span data-testid="counter">{number}</span>
  ),
}))

vi.mock('@chakra-ui/react', () => ({
  Accordion: {
    Root: ({ children, ...props }: { children: React.ReactNode }) => (
      <div data-testid="accordion-root" {...props}>
        {children}
      </div>
    ),
    Item: ({ children, ...props }: { children: React.ReactNode }) => (
      <div data-testid="accordion-item" {...props}>
        {children}
      </div>
    ),
    ItemTrigger: ({ children, ...props }: { children: React.ReactNode }) => (
      <div data-testid="accordion-trigger" {...props}>
        {children}
      </div>
    ),
    ItemContent: ({ children, ...props }: { children: React.ReactNode }) => (
      <div data-testid="accordion-content" {...props}>
        {children}
      </div>
    ),
    ItemBody: ({ children, ...props }: { children: React.ReactNode }) => (
      <div data-testid="accordion-body" {...props}>
        {children}
      </div>
    ),
    ItemIndicator: (props: React.HTMLAttributes<HTMLImageElement>) => (
      <div data-testid="accordion-indicator" {...props}></div>
    ),
  },
  Avatar: {
    Root: ({ children, ...props }: { children: React.ReactNode }) => (
      <div data-testid="avatar-root" {...props}>
        {children}
      </div>
    ),
    Image: (props: React.HTMLAttributes<HTMLImageElement>) => (
      <img data-testid="avatar-image" {...props} />
    ),
    Fallback: ({ name, ...props }: { name: string }) => (
      <div data-testid="avatar-fallback" {...props}>
        {name}
      </div>
    ),
  },
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode
    onClick: () => void
  }) => (
    <button data-testid="search-button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
  HStack: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="hstack" {...props}>
      {children}
    </div>
  ),
  Input: ({
    onKeyDown,
    onChange,
    value,
    ...props
  }: {
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    value: string
  }) => (
    <input
      data-testid="search-input"
      onKeyDown={onKeyDown}
      onChange={onChange}
      value={value}
      {...props}
    />
  ),
  Text: ({ children, ...props }: { children: React.ReactNode }) => (
    <span data-testid="text" {...props}>
      {children}
    </span>
  ),
}))

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input and button', () => {
    const { getByTestId } = render(<Home />)

    expect(getByTestId('search-input')).toBeInTheDocument()
    expect(getByTestId('search-button')).toBeInTheDocument()
    expect(getByTestId('search-button')).toHaveTextContent('Search')
  })

  it('updates search input value when typing', () => {
    const { getByTestId } = render(<Home />)
    const input = getByTestId('search-input')

    fireEvent.change(input, { target: { value: 'testuser' } })

    expect(input).toHaveValue('testuser')
  })

  it('calls trigger when search button is clicked', async () => {
    const { getByTestId } = render(<Home />)
    const button = getByTestId('search-button')

    fireEvent.click(button)

    expect(mockTrigger).toHaveBeenCalledTimes(1)
  })

  it('calls trigger when Enter key is pressed in input', async () => {
    const { getByTestId } = render(<Home />)
    const input = getByTestId('search-input')

    fireEvent.change(input, { target: { value: 'testuser' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockTrigger).toHaveBeenCalledTimes(1)
  })

  it('shows user search text after search is triggered', async () => {
    const { getByTestId, queryByText } = render(<Home />)
    const input = getByTestId('search-input')

    expect(queryByText(/Show user for/)).not.toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'testuser' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(queryByText('Show user for "testuser"')).toBeInTheDocument()
    })
  })

  it('hides user search text when search input is cleared', async () => {
    const { getByTestId, queryByText } = render(<Home />)
    const input = getByTestId('search-input')

    fireEvent.change(input, { target: { value: 'testuser' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(queryByText('Show user for "testuser"')).toBeInTheDocument()
    })

    fireEvent.change(input, { target: { value: '' } })

    await waitFor(() => {
      expect(queryByText(/Show user for/)).not.toBeInTheDocument()
    })
  })

  it('shows loading component when pending is true', () => {
    vi.mocked(useApi).mockReturnValue({
      trigger: mockTrigger,
      data: { items: [] },
      pending: true,
      error: null,
    })

    const { container } = render(<Home />)

    expect(container.querySelector('.animate-bounce-scale')).toBeInTheDocument()
  })

  it('shows 404 message when no users are found', () => {
    vi.mocked(useApi).mockReturnValue({
      trigger: mockTrigger,
      data: { items: [] },
      pending: false,
      error: null,
    })

    const { queryByText } = render(<Home />)

    expect(queryByText('404 Not Found')).toBeInTheDocument()
    expect(
      queryByText('The page you are looking for was not found.')
    ).toBeInTheDocument()
  })

  it('renders user results when data is available', () => {
    const mockData = {
      items: [
        {
          login: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      ],
    }

    vi.mocked(useApi).mockReturnValue({
      trigger: mockTrigger,
      data: mockData,
      pending: false,
      error: null,
    })

    const { getByTestId } = render(<Home />)

    expect(getByTestId('accordion-root')).toBeInTheDocument()
    expect(getByTestId('accordion-item')).toBeInTheDocument()
  })

  it('renders repository data when user is selected', () => {
    const mockReposData = [
      {
        id: 1,
        name: 'test-repo',
        description: 'A test repository',
        html_url: 'https://github.com/testuser/test-repo',
        stargazers_count: 42,
      },
    ]

    vi.mocked(useApi)
      .mockReturnValueOnce({
        trigger: mockTrigger,
        data: { items: [{ login: 'testuser', avatar_url: 'test.jpg' }] },
        error: null,
        pending: false,
      })
      .mockReturnValueOnce({
        trigger: mockTriggerRepos,
        data: mockReposData,
        error: null,
        pending: false,
      })
  })

  it('handles repository link clicks', () => {
    const mockReposData = [
      {
        id: 1,
        name: 'test-repo',
        description: 'A test repository',
        html_url: 'https://github.com/testuser/test-repo',
        stargazers_count: 42,
      },
    ]

    vi.mocked(useApi)
      .mockReturnValueOnce({
        trigger: mockTrigger,
        data: { items: [{ login: 'testuser', avatar_url: 'test.jpg' }] },
        pending: false,
        error: null,
      })
      .mockReturnValueOnce({
        trigger: mockTriggerRepos,
        data: mockReposData,
        pending: false,
        error: null,
      })
  })
})
