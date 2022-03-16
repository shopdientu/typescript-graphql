import React from 'react'
import { Formik, Form, FormikHelpers } from 'formik'
import { Button, Flex, FormControl, Spinner } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import InputField from '../components/form/InputField'
// import { registerMutation } from '../graphql/mutations/mutation'
import { RegisterInput, useRegisterMutation } from '../generated/graphql'
import { mapFieldErrors } from '../helpers/mapFieldErrors'
import { useRouter } from 'next/router'
import { checkAuth } from '../utils/checkAuth'
import Navbar from '../components/Navbar'

const Register = () => {
  const router = useRouter()
  const { data: dataAuth, loading: loadingAuth } = checkAuth()

  const initialValues: RegisterInput = { username: '', email: '', password: '' }

  const [registerUser, { loading: _useRegisterMutation, data, error }] = useRegisterMutation()

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: { registerInput: values },
    })
    if (response.data?.register.errors) {
      setErrors(mapFieldErrors(response.data.register.errors))
    } else if (response.data?.register.user) {
      router.push('/login')
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
          <Formik onSubmit={onRegisterSubmit} initialValues={initialValues}>
            {({ isSubmitting }) => (
              <Form>
                <FormControl>
                  <InputField name="username" placeholder="Username" label="Username" />
                  <InputField name="email" placeholder="email" label="email" />
                  <InputField
                    name="password"
                    placeholder="Password"
                    label="Password"
                    type="password"
                  />
                  <Button type="submit" colorScheme={'teal'} isLoading={isSubmitting}>
                    Register
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

export default Register
