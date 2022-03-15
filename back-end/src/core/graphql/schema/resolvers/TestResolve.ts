import { Context } from './../typeDefs/Context'
import { Ctx, Query, Resolver } from 'type-graphql'

@Resolver()
export class TestResolver {
  @Query((_return) => String)
  hello(@Ctx() { req }: Context) {
    console.log(req.session.userId)
    return `hello world`
  }
}
