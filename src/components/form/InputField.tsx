import React from 'react'
import { useField } from 'formik'
import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from '@chakra-ui/react'

interface IInputFieldProps {
  type?: string
  label: string
  placeholder: string
  name: string
  textarea?: boolean
  value?: string
}

const InputField = ({ textarea, ...props }: IInputFieldProps) => {
  // const { type, label, placeholder, name } = props

  const [field, { error }] = useField(props)
  return (
    <FormControl hidden={props.type === 'hidden'} isInvalid={!!error} marginBottom={5}>
      <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
      {textarea ? (
        <Textarea id={field.name} {...field} {...props} />
      ) : (
        <Input id={field.name} {...field} {...props} />
      )}

      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  )
}

export default InputField
