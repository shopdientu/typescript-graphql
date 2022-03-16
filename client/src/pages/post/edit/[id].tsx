import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  Flex,
  FormControl,
  Link as LinkUi,
  Spinner,
} from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import Link from 'next/link'
import { useRouter } from 'next/router'
import InputField from '../../../components/form/InputField'
import Layout from '../../../components/Layout'
import Wrapper from '../../../components/Wrapper'
import {
  UpdatePostInput,
  useMeQuery,
  usePostQuery,
  useUpdatePostMutation,
} from '../../../generated/graphql'

const PostEdit = () => {
  const router = useRouter()
  const { data: meData, loading: meLoading } = useMeQuery()

  const { data: postData, loading: postLoading } = usePostQuery({
    variables: {
      id: router.query.id as string,
    },
  })

  // Logic Update Post
  const [updatePost, _] = useUpdatePostMutation()
  const initialValues: UpdatePostInput = {
    text: postData?.post?.text as string,
    title: postData?.post?.title as string,
    id: postData?.post?.id.toString() as string,
  }
  const onUpdatePostSubmit = async (values: UpdatePostInput) => {
    await updatePost({ variables: { updatePostInput: values } })
    router.back()
  }

  if (meLoading || postLoading || !router.query.id) {
    return (
      <Layout>
        <Flex alignContent={'center'} minH={'100vh'} justifyContent={'center'}>
          <Spinner />
        </Flex>
      </Layout>
    )
  }

  if (meData?.me?.id != postData?.post?.userId) {
    return (
      <Layout>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>UNAUTHORIZED</AlertTitle>
        </Alert>
        <Link href={'/'}>
          <LinkUi mt={10} fontSize={25} color={'teal'}>
            Back to home
          </LinkUi>
        </Link>
      </Layout>
    )
  }

  return (
    <Layout>
      <Wrapper size="small">
        <Formik onSubmit={onUpdatePostSubmit} initialValues={initialValues}>
          {({ isSubmitting }) => (
            <Form>
              <FormControl>
                <InputField
                  name="id"
                  placeholder="id"
                  label="id"
                  type="text"
                  value={postData?.post?.id.toString() as string}
                />
                <InputField name="title" placeholder="Title" label="Title" />
                <InputField name="text" placeholder="Text" label="Text" textarea type="textarea" />
                <Flex>
                  <Button type="submit" colorScheme={'teal'} isLoading={isSubmitting}>
                    Update Post
                  </Button>
                  <Link href={'/'}>
                    <Button ml="auto" color={'teal'}>
                      Back to home
                    </Button>
                  </Link>
                </Flex>
              </FormControl>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  )
}

export default PostEdit
