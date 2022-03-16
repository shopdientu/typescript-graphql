import React from 'react'
import { Formik, Form, FormikHelpers } from 'formik'
import { Button, Flex, FormControl, Spinner, useToast } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import InputField from '../components/form/InputField'
import { LoginInput, useLoginMutation, MeQuery, MeDocument } from '../generated/graphql'
import { mapFieldErrors } from '../helpers/mapFieldErrors'
import { useRouter } from 'next/router'
import { checkAuth } from '../utils/checkAuth'
import Link from 'next/link'
import { initializeApollo } from '../lib/apolloClient'

const Login = () => {
  const router = useRouter()
  const { data: dataAuth, loading: loadingAuth } = checkAuth()
  const toast = useToast()

  const initialValues: LoginInput = { usernameOrEmail: '', password: '' }

  const [loginUser, { loading: _useLoginMutation, error }] = useLoginMutation()

  const onLoginSubmit = async (values: LoginInput, { setErrors }: FormikHelpers<LoginInput>) => {
    const response = await loginUser({
      variables: { loginInput: values },
      update(cache, { data }) {
        // console.log('Data Login:', data)
        if (data?.login.success) {
          // console.log(data?.login.user)
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: data?.login.user },
          })
        }
      },
    })
    if (response.data?.login.errors) {
      setErrors(mapFieldErrors(response.data.login.errors))
    } else if (response.data?.login.user) {
      response.data &&
        response.data.login.success &&
        toast({
          title: 'Bạn đã đăng nhập thành công',
          description: response.data.login.user.username,
          status: 'success',
          duration: 1000,
          isClosable: true,
        })
      const apolloClient = initializeApollo()
      apolloClient.resetStore()
      router.push('/')
    }
  }

  return (
    <>
      {loadingAuth || dataAuth?.me ? (
        <Flex border="1px solid red" justifyContent="center" alignItems="center" minH="100vh">
          <Spinner />
        </Flex>
      ) : (
        <Wrapper size="small">
          {error && console.log(error)}
          {}
          <Formik onSubmit={onLoginSubmit} initialValues={initialValues}>
            {({ isSubmitting }) => (
              <Form>
                <FormControl>
                  <InputField
                    name="usernameOrEmail"
                    placeholder="Username Or Email"
                    label="Username Or Email"
                  />
                  <InputField
                    name="password"
                    placeholder="Password"
                    label="Password"
                    type="password"
                  />
                  <Flex color={'teal'} justifyContent="flex-end" marginBottom={5}>
                    <Link href="/forgot-password">Forgot Password ???</Link>
                  </Flex>

                  <Button type="submit" colorScheme={'teal'} isLoading={isSubmitting}>
                    Login
                  </Button>
                </FormControl>
              </Form>
            )}
          </Formik>
        </Wrapper>
      )}
    </>
  )
}

export default Login
