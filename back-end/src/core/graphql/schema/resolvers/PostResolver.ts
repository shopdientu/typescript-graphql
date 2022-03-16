import { Upvote } from './../../../databases/postgres/entity/Upvote'
import { PaginatedPosts } from './../typeDefs/PaginatedPosts'
import { User } from './../../../databases/postgres/entity/User'
import { checkAuth } from './../../../middleware/checkAuth'
import { Post } from './../../../databases/postgres/entity/Post'
import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  registerEnumType,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'
import { StatusCodes } from 'http-status-codes'
import { PostMutationResponse } from '../typeDefs/PostMutationResponse'
import { CreatePostInput } from '../typeDefs/CreatePostInput'
import { UpdatePostInput } from '../typeDefs/UpdatePostInput'
import { FindManyOptions, LessThan } from 'typeorm'
import { Context } from '../typeDefs/Context'
import { VoteType } from '../typeDefs/VoteType'
import { UserInputError } from 'apollo-server-express'

registerEnumType(VoteType, {
  name: 'VoteType',
})

@Resolver((_of) => Post)
export class PostResolver {
  @FieldResolver((_return) => String)
  textSnipper(@Root() root: Post): string {
    return root.text.slice(0, 50)
  }

  @FieldResolver((_return) => Number)
  async totalVote(@Root() root: Post) {
    const totalVotes = (await Upvote.find({ postId: root.id })).reduce((a, b) => a + b.value, 0)
    return totalVotes
  }

  @FieldResolver()
  async user(
    @Root() { userId }: Post,
    @Ctx() { dataLoaders: { userLoader } }: Context
  ): Promise<User | undefined> {
    // return await User.findOne(userId)
    return await userLoader.load(userId)
  }

  @FieldResolver((_return) => Int)
  async voteType(
    @Root() root: Post,
    @Ctx()
    {
      req: {
        session: { userId },
      },
      dataLoaders: { voteTypeLoader },
    }: Context
  ): Promise<number> {
    if (!userId) return 0
    // const existingVote = await Upvote.findOne({ postId: root.id, userId })
    const existingVote = await voteTypeLoader.load({ postId: root.id, userId: userId })

    return existingVote ? existingVote.value : 0
  }

  @Query((_return) => PaginatedPosts)
  async posts(
    @Arg('limit') limit: number,
    @Arg('cursor', { nullable: true }) cursor?: string
  ): Promise<PaginatedPosts> {
    const totalPostCount = await Post.count()
    const findOption: FindManyOptions<Post> = {
      order: {
        createAt: 'DESC',
      },
      take: Math.min(10, limit),
    }
    let lastPost: Post[] = []
    if (cursor) {
      findOption.where = { createAt: LessThan(cursor) }
      lastPost = await Post.find({ order: { createAt: 'ASC' }, take: 1 })
    }

    const posts = await Post.find(findOption)

    return {
      totalCount: totalPostCount,

      cursor: posts[posts.length - 1].createAt,
      hasMore: cursor
        ? posts[posts.length - 1].createAt.toString() !== lastPost[0].createAt.toString()
        : posts.length !== totalPostCount,
      paginatedPosts: posts,
    }
  }

  @Query((_return) => Post, { nullable: true })
  async post(@Arg('id', (_type) => String) id: string): Promise<Post | undefined> {
    // console.log(parseInt(id))
    const post = await Post.findOne({ id: parseInt(id) })
    return post
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg('createPostInput') { text, title }: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const userId = req.session.userId
      const newPost = Post.create({ title, text, userId })
      await newPost.save()
      // console.log(title)
      return {
        code: StatusCodes.OK,
        message: 'Create post success fully',
        success: true,
        post: newPost,
      }
    } catch (error) {
      console.log(error)
      return {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Server error',
        success: false,
      }
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg('updatePostInput') { id, text, title }: UpdatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const exitingPost = await Post.findOne(id)

      if (!exitingPost)
        return {
          code: StatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE,
          message: `Notfound Post with id is ${id}`,
          success: false,
          errors: [{ field: 'id', message: `Notfound Post with id is ${id} ` }],
        }
      if (exitingPost.userId !== req.session.userId) {
        return {
          code: StatusCodes.UNAUTHORIZED,
          message: `Notfound Post with id is ${id}`,
          success: false,
          errors: [{ field: 'id' }],
        }
      }
      exitingPost.title = title
      exitingPost.text = text
      await exitingPost.save()
      return {
        code: StatusCodes.OK,
        message: 'Update post success fully',
        success: true,
        post: exitingPost,
      }
    } catch (error) {
      console.log(error)
      return {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Server error',
        success: false,
      }
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg('id', (_type) => ID) id: number,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    const exitingPost = await Post.findOne(id)

    if (!exitingPost)
      return {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'NotFound Post ID',
        success: false,
      }
    if (exitingPost.userId !== req.session.userId)
      return {
        code: StatusCodes.UNAUTHORIZED,
        message: 'UNAUTHORIZED',
        success: false,
      }

    await Post.delete(id)
    return {
      code: 200,
      message: 'success',
      success: true,
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async vote(
    @Arg('postId', (_type) => Int) postId: number,
    @Arg('inputVoteValue', (_type) => VoteType) inputVoteValue: VoteType,
    @Ctx()
    {
      connect,
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<PostMutationResponse> {
    return await connect.transaction(async (transactionEntityManager) => {
      //Check post existing
      let post = await transactionEntityManager.findOne(Post, postId)
      if (!post) throw new UserInputError('Post Not Found')

      const existingVote = await transactionEntityManager.findOne(Upvote, { postId, userId })

      //Check vote value in Upvote
      if (existingVote && existingVote.value !== inputVoteValue) {
        await transactionEntityManager.save(Upvote, {
          ...existingVote,
          value: inputVoteValue,
        })
        post = await transactionEntityManager.save(Post, {
          ...post,
          points: post.points + inputVoteValue,
        })
      }

      if (!existingVote) {
        const newVote = transactionEntityManager.create(Upvote, {
          userId,
          postId,
          value: inputVoteValue,
        })
        await transactionEntityManager.save(newVote)
        post.points = post.points + inputVoteValue
        post = await transactionEntityManager.save(post)
      }

      return {
        code: 200,
        message: 'success',
        success: true,
        post: post,
      }
    })
  }
}
