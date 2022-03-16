import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Link as LinkUi,
  Spinner,
} from '@chakra-ui/react'
import { Form, Formik, FormikHelpers } from 'formik'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import InputField from '../components/form/InputField'
import Wrapper from '../components/Wrapper'
import {
  ChangePasswordInput,
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from '../generated/graphql'
import { mapFieldErrors } from '../helpers/mapFieldErrors'
import { checkAuth } from '../utils/checkAuth'

const ChangePassword = () => {
  const {
    query: { userId, token },
    push,
  } = useRouter()
  const initialValues: ChangePasswordInput = { newPassword: '' }
  const [tokenError, setTokenError] = useState('')
  const [changePassword, {}] = useChangePasswordMutation()
  const onChangePassword = async (
    values: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>
  ) => {
    if (userId && token) {
      const res = await changePassword({
        variables: {
          userId: userId as string,
          token: token as string,
          changePasswordInput: values,
        },
        update(cache, { data }) {
          if (data?.changePassword.success) {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: { me: data?.changePassword.user },
            })
          }
        },
      })

      if (res.data?.changePassword.errors) {
        const fieldError = mapFieldErrors(res.data?.changePassword.errors)
        if ('token' in fieldError) {
          setTokenError(fieldError.token)
        }
        setErrors(fieldError)
      } else if (res.data?.changePassword.user) {
        push('/')
      }
      console.log(res.data?.changePassword)
    }
  }
  // Loading and Check login user
  const { data: authData, loading: authLoading } = checkAuth()
  if (authLoading || authData?.me) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    )
  }
  if (!userId || !token) {
    return (
      <Wrapper size="small">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle> Invalid password change</AlertTitle>
        </Alert>
        <Flex mt={2}>
          <LinkUi color="teal" ml="auto">
            <Link href="/login">Back to login</Link>
          </LinkUi>
        </Flex>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Formik onSubmit={onChangePassword} initialValues={initialValues}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name="newPassword" placeholder="New Password" label="New Password" />
            {tokenError && (
              <Flex>
                <Box color="red">{tokenError}</Box>
                <LinkUi>
                  <Link href="/forgot-password">Go back forgot password</Link>
                </LinkUi>
              </Flex>
            )}
            <Button type="submit" colorScheme={'teal'} isLoading={isSubmitting}>
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default ChangePassword
