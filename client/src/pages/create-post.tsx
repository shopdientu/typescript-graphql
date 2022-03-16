import { Box, Button, Flex, Spinner } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import Link from 'next/link'
import router from 'next/router'
import InputField from '../components/form/InputField'
import Layout from '../components/Layout'
import { CreatePostInput, useCreatedPostMutation } from '../generated/graphql'
import { checkAuth } from '../utils/checkAuth'

const CreatePost = () => {
  const { data: authData, loading: authLoading } = checkAuth()
  if (authLoading || (!authData?.me && !authLoading)) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    )
  }

  const initialValues: CreatePostInput = { title: '', text: '' }

  const [createPost, { loading: loadingCreatePost }] = useCreatedPostMutation()

  const onCreatePostSubmit = async (values: CreatePostInput) => {
    await createPost({
      variables: {
        createPostInput: values,
      },
      update(cache, { data }) {
        cache.modify({
          fields: {
            posts({ ...existing }) {
              console.log('EXISTING:', existing)
              if (data?.createPost.post && data.createPost.success) {
                // cache.identify() => { textSnippet, title, user, id  }
                const newPostRef = cache.identify(data.createPost.post)
                console.log('New Post Ref: ', existing)
                const newPostAfterCreation = {
                  ...existing,
                  totalCount: existing.totalCount + 1,
                  paginatedPosts: [{ __ref: newPostRef }, ...existing.paginatedPosts],
                }
                console.log('createdPost:', existing)
                return newPostAfterCreation
              }
            },
          },
        })
      },
    })
    console.log(123)
    router.push('/')
  }
  return (
    <Layout>
      <Formik initialValues={initialValues} onSubmit={onCreatePostSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" label="Title" placeholder="Title" />

            <Box mt={4}>
              <InputField textarea={true} name="text" label="Content" placeholder="Content Post" />
            </Box>
            <Flex mt={4} justifyContent={'space-between'} alignItems={'center'}>
              <Button
                colorScheme={'teal'}
                isLoading={isSubmitting || loadingCreatePost}
                type={'submit'}
              >
                Create Post
              </Button>

              <Link href="/login">
                <Button color={'teal'}>Back to login </Button>
              </Link>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export default CreatePost
