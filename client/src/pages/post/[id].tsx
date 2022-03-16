import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Heading,
  Link as LinkUi,
  Spinner,
} from '@chakra-ui/react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import PostEditDeleteButton from '../../components/PostEditDeleteButton'
import {
  PostDocument,
  PostIdsDocument,
  PostIdsQuery,
  PostQuery,
  usePostQuery,
} from '../../generated/graphql'
import { addApolloState, initializeApollo } from '../../lib/apolloClient'

const Post = () => {
  const router = useRouter()

  const { data, loading, error } = usePostQuery({
    variables: {
      id: router.query.id as string,
    },
  })
  if (loading && !data) {
    return (
      <Layout>
        <Flex justifyContent={'center'} alignItems="center" minH={'100vh'}>
          <Spinner />
        </Flex>
      </Layout>
    )
  } else if (error)
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle> {error.message}</AlertTitle>
      </Alert>
    )
  else if (!data?.post && !loading)
    return (
      <>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle> Page Not Found</AlertTitle>
        </Alert>
        <Link href={'/'}>
          <LinkUi mt={10} fontSize={25} color={'teal'}>
            Back to home
          </LinkUi>
        </Link>
      </>
    )
  else if (data?.post)
    return (
      <Layout>
        <Heading mb={4}>{data.post.title} </Heading>
        <Box mb={4}>{data.post.text}</Box>
        <Flex mt={4} justifyContent="space-between" alignItems={'center'}>
          <PostEditDeleteButton
            postId={data.post.id.toString()}
            postUserId={data.post.userId.toString()}
          />

          <Link href={'/'}>
            <Button mt={10} color={'teal'}>
              Back to home
            </Button>
          </Link>
        </Flex>
      </Layout>
    )

  return (
    <Layout>
      <Flex justifyContent={'center'} alignItems="center" minH={'100vh'}>
        <Spinner />
      </Flex>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const apolloClient = initializeApollo()
  const { data } = await apolloClient.query<PostIdsQuery>({
    query: PostIdsDocument,
    variables: { limit: 3 },
  })
  return {
    paths: data.posts.paginatedPosts.map((post) => ({
      params: { id: `${post.id}` },
    })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<{ [key: string]: any }, { id: string }> = async ({
  params,
}) => {
  const apolloClient = initializeApollo()
  await apolloClient.query<PostQuery>({
    query: PostDocument,
    variables: { id: params?.id },
  })

  return addApolloState(apolloClient, { props: {} })
}

export default Post
