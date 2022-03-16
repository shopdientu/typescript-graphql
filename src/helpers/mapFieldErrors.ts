import { FieldError } from './../generated/graphql'
export const mapFieldErrors = (errors: FieldError[]): { [key: string]: any } =>
  errors.reduce(
    (acc, error) => ({
      ...acc,
      [error.field]: error.message,
    }),
    {}
  )
