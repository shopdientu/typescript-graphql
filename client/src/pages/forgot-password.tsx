import { Box, Button, Flex, Spinner } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import Link from 'next/link'
import InputField from '../components/form/InputField'
import Wrapper from '../components/Wrapper'
import { ForgotPasswordInput, useForgotPasswordMutation } from '../generated/graphql'
import { checkAuth } from '../utils/checkAuth'

const ForgotPassword = () => {
  const initialValues = { email: '' }
  const [forgotPassword, { data, loading }] = useForgotPasswordMutation()

  const { data: authData, loading: authLoading } = checkAuth()

  if (authLoading || authData?.me) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    )
  }

  const onForgotPassword = async (values: ForgotPasswordInput) => {
    await forgotPassword({
      variables: {
        forgotPasswordInput: values,
      },
    })
  }
  // console.log(data, loading)
  return (
    <Wrapper size="small">
      <Formik onSubmit={onForgotPassword} initialValues={initialValues}>
        {({ isSubmitting }) =>
          !loading && data?.forgotPassword ? (
            <Box>please check your inbox</Box>
          ) : (
            <Form>
              <InputField name="email" placeholder="Email" label="Email" />
              <Flex color={'teal'} mt={3} justifyContent="flex-end">
                <Link href="/login">Back to login</Link>
              </Flex>
              <Button mt={3} type="submit" colorScheme={'teal'} isLoading={isSubmitting}>
                Forgot Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  )
}

export default ForgotPassword
