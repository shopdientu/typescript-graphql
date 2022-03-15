import { Post } from '../../../databases/postgres/entity/Post'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class PaginatedPosts {
  @Field((_type) => Number)
  totalCount: number

  @Field((_type) => Date)
  cursor!: Date

  @Field((_return) => Boolean)
  hasMore!: boolean

  @Field((_return) => [Post])
  paginatedPosts: Post[]
}
