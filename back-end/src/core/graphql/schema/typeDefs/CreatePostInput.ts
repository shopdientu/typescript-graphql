import { Field, InputType } from 'type-graphql'

@InputType()
export class CreatePostInput {
  @Field()
  text: string

  @Field()
  title: string
}
