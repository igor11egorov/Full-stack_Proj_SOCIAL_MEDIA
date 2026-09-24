// отвечает за лайк/комментарий прямо в ленте
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPostComments } from '../../comment/model/commentsThunks'
import {
  fetchPostLikes,
  togglePostLike,
} from '../../like/model/likesThunks'
import {
  fetchSubscriptionSummary,
  followUser,
  unfollowUser,
} from '../../subscription/model/subscriptionsThunks'
import { useAppDispatch, useAppSelector } from '../../../app/providers/hooks'
import type { Post } from '../types/post'
import { getPostCoverImage } from '../../../shared/lib/postImages'
import styles from './PostCard.module.css'

type PostCardProps = {
  post: Post
  onOpenPost: (post: Post) => void
}

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || ''

// Возвращает вычисленные данные: PostAgeLabel.
const getPostAgeLabel = (createdAt: string) => {
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  )

  if (diffMinutes < 60) return `${diffMinutes}m`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`

  return `${Math.floor(diffDays / 7)}w`
}

// Выполняет логику PostCard в текущем модуле.
function PostCard({ post, onOpenPost }: PostCardProps) {
  const dispatch = useAppDispatch()
  const { myProfile } = useAppSelector((state) => state.profile)
  const postLikes = useAppSelector((state) => state.likes.byPostId[post._id])
  const postComments = useAppSelector(
    (state) => state.comments.byPostId[post._id],
  )
  const { byUserId, followStatus } = useAppSelector(
    (state) => state.subscriptions,
  )

  const [likedOverride, setLikedOverride] = useState<{
    postId: string
    value: boolean
  } | null>(null)

  const currentUserId = getUserId(myProfile)
  const authorId = getUserId(post.author)
  const isOwnPost = Boolean(currentUserId && authorId === currentUserId)
  const subscriptionSummary = byUserId[authorId]
  const isFollowingAuthor = subscriptionSummary?.isFollowing ?? false
  const likesCount = postLikes?.count ?? 0
  const isPostLikedFromServer =
    postLikes?.likes.some((like) => getUserId(like.user) === currentUserId) ??
    false
  const isPostLiked =
    likedOverride?.postId === post._id
      ? likedOverride.value
      : isPostLikedFromServer
  const likesLabel = `${likesCount} ${likesCount === 1 ? 'like' : 'likes'}`
  const commentsCount = postComments?.count ?? 0
  const latestComment = postComments?.comments[0]

  useEffect(() => {
    dispatch(fetchPostLikes(post._id))
    dispatch(fetchPostComments(post._id))
  }, [dispatch, post._id])

  useEffect(() => {
    if (authorId && currentUserId && !isOwnPost) {
      dispatch(fetchSubscriptionSummary({ userId: authorId, currentUserId }))
    }
  }, [authorId, currentUserId, dispatch, isOwnPost])

  // Обрабатывает действие пользователя: ToggleLike.
  const handleToggleLike = () => {
    setLikedOverride({ postId: post._id, value: !isPostLiked })
    dispatch(togglePostLike(post._id))
  }

  // Обрабатывает действие пользователя: ToggleFollow.
  const handleToggleFollow = () => {
    if (!authorId || followStatus === 'loading') {
      return
    }

    if (isFollowingAuthor) {
      dispatch(unfollowUser(authorId))
      return
    }

    dispatch(followUser(authorId))
  }

  return (
    <article className={styles.postCard}>
      <header className={styles.postHeader}>
        <Link
          to={`/users/${getUserId(post.author)}`}
          aria-label={post.author.username}>
          <img
            className={styles.avatar}
            src={post.author.avatar || '/icons/ICH_avatar.png'}
            alt={`${post.author.username} avatar`}
          />
        </Link>

        <div className={styles.authorMeta}>
          <Link className={styles.username} to={`/users/${authorId}`}>
            {post.author.username}
          </Link>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.time}>{getPostAgeLabel(post.createdAt)}</span>
          <span className={styles.dot} aria-hidden="true" />
        </div>

        {!isOwnPost && (
          <button
            className={`${styles.followButton} ${
              isFollowingAuthor ? styles.followingButton : ''
            }`}
            type="button"
            disabled={followStatus === 'loading'}
            onClick={handleToggleFollow}>
            {isFollowingAuthor ? 'Following' : 'Follow'}
          </button>
        )}
      </header>

      <button
        className={styles.postImageButton}
        type="button"
        onClick={() => onOpenPost(post)}>
        <img
          className={styles.postImage}
          src={getPostCoverImage(post)}
          alt=""
        />
      </button>

      <div className={styles.actions}>
        <button
          className={`${styles.iconButton} ${
            isPostLiked ? styles.likedButton : ''
          }`}
          type="button"
          aria-label={isPostLiked ? 'Unlike post' : 'Like post'}
          onClick={handleToggleLike}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M16.8 3.8c-1.8 0-3.3 1-4.2 2.4C11.7 4.8 10.2 3.8 8.4 3.8 5.5 3.8 3.2 6 3.2 8.8c0 5.2 8.8 10.4 9.2 10.6.1.1.3.1.4 0 .4-.2 9.2-5.4 9.2-10.6 0-2.8-2.3-5-5.2-5Z" />
          </svg>
        </button>

        <button
          className={styles.iconButton}
          type="button"
          aria-label="Open comments"
          onClick={() => onOpenPost(post)}>
          <img src="/icons/button-comments.png" alt="" aria-hidden="true" />
        </button>
      </div>

      <p className={styles.likes}>{likesLabel}</p>

      {post.description && (
        <p className={styles.caption}>
          <span>{post.author.username}</span> <em>{post.description}</em>
        </p>
      )}

      {commentsCount > 0 && (
        <button
          className={styles.commentsButton}
          type="button"
          onClick={() => onOpenPost(post)}>
          View all {commentsCount}{' '}
          {commentsCount === 1 ? 'comment' : 'comments'}
        </button>
      )}

      {latestComment && (
        <p className={styles.previewComment}>
          <span>{latestComment.user.username}</span> {latestComment.text}
        </p>
      )}
    </article>
  )
}

export default PostCard
