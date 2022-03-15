import { FieldError } from './FieldError'
import { User } from './../../../databases/postgres/entity/User'
import { IMutationResponse } from './MutationResponse'
import { Field, ObjectType } from 'type-graphql'
import { StatusCodes } from 'http-status-codes'

@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse implements IMutationResponse {
  code: StatusCodes
  success: boolean
  message?: string | undefined

  @Field({ nullable: true })
  user?: User

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[]
}
