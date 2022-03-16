import { Reference } from '@apollo/client'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { Box, IconButton } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PaginatedPosts, useDeletePostMutation, useMeQuery } from '../generated/graphql'
;``
interface PostEditDeleteProps {
  postId: string
  postUserId: string
}

const PostEditDeleteButton = ({ postId, postUserId }: PostEditDeleteProps) => {
  const router = useRouter()
  const [deletePost, _] = useDeletePostMutation()
  const { data: meData, loading: meLoading } = useMeQuery()
  const onDeletePost = async (postId: string) => {
    await deletePost({
      variables: { id: postId },
      update(cache, { data }) {
        if (data?.deletePost.success) {
          cache.modify({
            fields: {
              posts(
                existing: Pick<PaginatedPosts, 'cursor' | 'hasMore' | 'totalCount'> & {
                  paginatedPosts: Reference[]
                }
              ) {
                return {
                  ...existing,
                  totalCount: existing.totalCount - 1,
                  paginatedPosts: existing.paginatedPosts.filter(
                    (post) => post.__ref !== `Post:${postId}`
                  ),
                }
              },
            },
          })
        }
      },
    })
    router.route !== '/' && router.push('/')
  }

  return (
    <Box hidden={meData?.me?.id !== postUserId || meLoading}>
      <Link href={`/post/edit/${postId}`}>
        <IconButton icon={<EditIcon />} aria-label="edit" mr={4} />
      </Link>
      <IconButton
        icon={<DeleteIcon />}
        onClick={onDeletePost.bind(this, postId)}
        aria-label="delete"
        colorScheme={'red'}
      />
    </Box>
  )
}

export default PostEditDeleteButton
