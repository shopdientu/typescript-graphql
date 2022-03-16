import { Upvote } from './../core/databases/postgres/entity/Upvote'
import DataLoader from 'dataloader'
import { User } from './../core/databases/postgres/entity/User'
const batchGetUsers = async (userId: number[]) => {
  const users = await User.findByIds(userId)
  return userId.map((id) => users.find((user) => user.id === id))
}

// Loader voteType
interface VoteTypeCondition {
  postId: number
  userId: number
}

const batchGetVoteTypes = async (voteTypeConditions: VoteTypeCondition[]) => {
  const voteTypes = await Upvote.findByIds(voteTypeConditions)
  return voteTypeConditions.map((objectId) =>
    voteTypes.find(
      (voteType) => voteType.postId == objectId.postId && voteType.userId == objectId.userId
    )
  )
}

export const buildDataLoaders = () => ({
  userLoader: new DataLoader<number, User | undefined>((userId) =>
    batchGetUsers(userId as number[])
  ),
  voteTypeLoader: new DataLoader<VoteTypeCondition, Upvote | undefined>((voteTypeConditions) =>
    batchGetVoteTypes(voteTypeConditions as VoteTypeCondition[])
  ),
})
