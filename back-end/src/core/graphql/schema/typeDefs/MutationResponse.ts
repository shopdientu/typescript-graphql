import { StatusCodes } from 'http-status-codes'
import { Field, InterfaceType } from 'type-graphql'

@InterfaceType()
export abstract class IMutationResponse {
  @Field()
  code: StatusCodes

  @Field()
  success: boolean

  @Field({ nullable: true })
  message?: string
}
