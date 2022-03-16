import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import { useState } from 'react'
import { PostWithUserInfoFragment, useVoteMutation, VoteType } from '../generated/graphql'

interface UpvoteSectionProps {
  post: PostWithUserInfoFragment
}

const UpvoteSection = ({ post }: UpvoteSectionProps) => {
  const [vote, { loading }] = useVoteMutation()
  const [loadingState, setLoadingState] = useState<'up' | 'down' | 'not'>('not')

  const upvote = async (postId: number) => {
    console.log(`ID: ${post.id}`, `vote: ${post.voteType}`)

    setLoadingState('up')
    await vote({
      variables: { postId, inputVoteValue: VoteType.Upvote },
    })
    setLoadingState('not')
  }
  const downvote = async (postId: number) => {
    setLoadingState('down')
    await vote({
      variables: { postId, inputVoteValue: VoteType.Downvote },
    })
    setLoadingState('not')
  }

  return (
    <Flex direction={'column'} alignItems="center" mr={4}>
      <IconButton
        icon={<ChevronUpIcon />}
        aria-label="upvote"
        onClick={upvote.bind(this, post.id)}
        isLoading={loading && loadingState === 'up'}
        colorScheme={post.voteType === 1 ? 'green' : undefined}
      />
      {post.totalVote}
      <IconButton
        icon={<ChevronDownIcon />}
        aria-label="downvote"
        onClick={downvote.bind(this, post.id)}
        isLoading={loading && loadingState === 'down'}
        colorScheme={post.voteType === -1 ? 'red' : undefined}
      />
    </Flex>
  )
}

export default UpvoteSection
