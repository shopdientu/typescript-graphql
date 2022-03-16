import { Box, Button, Flex, Heading, Link as LinkUi } from '@chakra-ui/react'
import Link from 'next/link'
import React, { ReactNode } from 'react'
import { MeDocument, MeQuery, useLogoutMutation, useMeQuery } from '../generated/graphql'
import { gql, Reference } from '@apollo/client'

const Navbar = () => {
  const { data: dataLogin, loading: loadingLogin } = useMeQuery()
  const [logout, { loading: loadingLogout }] = useLogoutMutation()

  const logoutUser = async () => {
    await logout({
      update(cache, { data }) {
        if (data?.logout) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: null },
          })
          cache.modify({
            fields: {
              posts(existing) {
                existing.paginatedPosts.forEach((post: Reference) => {
                  cache.writeFragment({
                    id: post.__ref,
                    fragment: gql`
                      fragment VoteType on Post {
                        voteType
                      }
                    `,
                    data: {
                      voteType: 0,
                    },
                  })
                })
                return existing
              },
            },
          })
        }
      },
    })
  }

  let body: ReactNode | null

  if (loadingLogin) body = null
  else if (!dataLogin?.me)
    body = (
      <>
        <Link href={'/login'}>
          <LinkUi margin={5}>Login</LinkUi>
        </Link>
        <Link href={'/register'}>
          <LinkUi>Register</LinkUi>
        </Link>
      </>
    )
  else
    body = (
      <Flex>
        <Link href={'/create-post'}>
          <Button mr={4}>Create Post</Button>
        </Link>
        <Button onClick={logoutUser} isLoading={loadingLogout}>
          Logout
        </Button>
      </Flex>
    )

  return (
    <Box bg="tan" p={4}>
      <Flex maxW={800} justifyContent="space-between" align="center" m="auto">
        <Heading color={'teal'}>
          <Link href={'/'}>
            <LinkUi>Reddit</LinkUi>
          </Link>
        </Heading>
        <Box>{body}</Box>
      </Flex>
    </Box>
  )
}

export default Navbar
