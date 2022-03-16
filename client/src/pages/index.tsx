import { NetworkStatus } from '@apollo/client'
import { Box, Button, Flex, Heading, Link as LinkUi, Spinner, Stack, Text } from '@chakra-ui/react'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'
import PostEditDeleteButton from '../components/PostEditDeleteButton'
import UpvoteSection from '../components/UpvoteSection'
import { PostsDocument, usePostsQuery } from '../generated/graphql'
import { addApolloState, initializeApollo } from '../lib/apolloClient'

const limit: number = 3

const Index = () => {
  const { data, loading, fetchMore, networkStatus } = usePostsQuery({
    variables: { limit },

    //component nào render bởi cái Post query, sẽ render khi networkStatus thay đổi , tức là fetchMore
    notifyOnNetworkStatusChange: true,
  })

  const loadingMorePost: boolean = networkStatus === NetworkStatus.fetchMore

  const loadMorePost = () => {
    return fetchMore({
      variables: {
        cursor: data?.posts.cursor,
      },
    })
  }

  return (
    <Layout>
      {loading && !loadingMorePost ? (
        <Flex alignContent={'center'} minH={'100vh'} justifyContent={'center'}>
          <Spinner />
        </Flex>
      ) : (
        <Stack spacing={8}>
          {data?.posts.paginatedPosts.map((post) => (
            <Flex key={post.id} p={5} shadow="md" borderWidth={1}>
              <UpvoteSection post={post} />
              <Box flex={1}>
                <Link href={`/post/${post.id}`}>
                  <LinkUi color={'teal'}>
                    <Heading fontSize={'xl'}>
                      {post.title} ---- {'Post ID :' + post.id}
                    </Heading>
                  </LinkUi>
                </Link>
                <Flex mt={4}>
                  <Text mr={2}>User : </Text>
                  <Text color={'teal'}> {'  ' + post.user.username}</Text>
                </Flex>

                <Flex align={'center'}>
                  <Text mt={4}>{post.textSnipper}</Text>

                  <Box ml={'auto'}>
                    <PostEditDeleteButton postId={`${post.id}`} postUserId={post.user.id} />
                  </Box>
                </Flex>
                <Text w={'100%'}>Ngày tạo ---- {post.createAt}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data?.posts.hasMore && (
        <Flex mt={5}>
          <Button m="auto" isLoading={loadingMorePost} onClick={loadMorePost}>
            {loadingMorePost ? 'Loading ...' : 'Show More'}
          </Button>
        </Flex>
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const apolloClient = initializeApollo({ headers: context.req.headers })

  await apolloClient.query({
    query: PostsDocument,
    variables: { limit },
  })

  return addApolloState(apolloClient, {
    props: {},
  })
}

export default Index
