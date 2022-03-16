import { ChakraProvider } from '@chakra-ui/react'
import { ApolloProvider } from '@apollo/client'
import theme from '../theme'
import { AppProps } from 'next/app'
import { useApollo } from '../lib/apolloClient'

// const httpLink = new HttpLink({
//   uri: 'http://localhost:5000/graphql',
//   credentials: 'include',
// })
// const client = new ApolloClient({
//   link: httpLink,
//   cache: new InMemoryCache(),
//   credentials: 'include',
// })

function MyApp({ Component, pageProps }: AppProps) {
  const client = useApollo(pageProps)
  return (
    <ApolloProvider client={client}>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  )
}

export default MyApp
