import { FieldError } from './FieldError'
import { Post } from './../../../databases/postgres/entity/Post'
import { StatusCodes } from 'http-status-codes'
import { Field, ObjectType } from 'type-graphql'
import { IMutationResponse } from './MutationResponse'

@ObjectType({ implements: IMutationResponse })
export class PostMutationResponse implements IMutationResponse {
  code: StatusCodes
  message?: string | undefined
  success: boolean

  @Field({ nullable: true })
  post?: Post

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[]
}
