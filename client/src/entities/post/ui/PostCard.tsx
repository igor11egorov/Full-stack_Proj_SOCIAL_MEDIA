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

// Хранит значение «getUserId», необходимое для текущего логического блока.
const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || ''

// Возвращает вычисленные данные: PostAgeLabel.
const getPostAgeLabel = (createdAt: string) => {
  // Хранит значение «diffMinutes», необходимое для текущего логического блока.
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  )

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (diffMinutes < 60) return `${diffMinutes}m`

  // Хранит значение «diffHours», необходимое для текущего логического блока.
  const diffHours = Math.floor(diffMinutes / 60)
  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (diffHours < 24) return `${diffHours}h`

  // Хранит значение «diffDays», необходимое для текущего логического блока.
  const diffDays = Math.floor(diffHours / 24)
  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (diffDays < 7) return `${diffDays}d`

  return `${Math.floor(diffDays / 7)}w`
}

// Выполняет логику PostCard в текущем модуле.
function PostCard({ post, onOpenPost }: PostCardProps) {
  // Хранит значение «dispatch», необходимое для текущего логического блока.
  const dispatch = useAppDispatch()
  const { myProfile } = useAppSelector((state) => state.profile)
  // Хранит значение «postLikes», необходимое для текущего логического блока.
  const postLikes = useAppSelector((state) => state.likes.byPostId[post._id])
  // Хранит значение «postComments», необходимое для текущего логического блока.
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

  // Хранит значение «currentUserId», необходимое для текущего логического блока.
  const currentUserId = getUserId(myProfile)
  // Хранит значение «authorId», необходимое для текущего логического блока.
  const authorId = getUserId(post.author)
  // Хранит результат проверки условия для последующей логики интерфейса.
  const isOwnPost = Boolean(currentUserId && authorId === currentUserId)
  // Хранит значение «subscriptionSummary», необходимое для текущего логического блока.
  const subscriptionSummary = byUserId[authorId]
  // Хранит результат проверки условия для последующей логики интерфейса.
  const isFollowingAuthor = subscriptionSummary?.isFollowing ?? false
  // Задаёт ограничение, используемое при проверке или отображении данных.
  const likesCount = postLikes?.count ?? 0
  // Хранит результат проверки условия для последующей логики интерфейса.
  const isPostLikedFromServer =
    postLikes?.likes.some((like) => getUserId(like.user) === currentUserId) ??
    false
  // Хранит результат проверки условия для последующей логики интерфейса.
  const isPostLiked =
    likedOverride?.postId === post._id
      ? likedOverride.value
      : isPostLikedFromServer
  // Хранит значение «likesLabel», необходимое для текущего логического блока.
  const likesLabel = `${likesCount} ${likesCount === 1 ? 'like' : 'likes'}`
  // Задаёт ограничение, используемое при проверке или отображении данных.
  const commentsCount = postComments?.count ?? 0
  // Хранит значение «latestComment», необходимое для текущего логического блока.
  const latestComment = postComments?.comments[0]

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    dispatch(fetchPostLikes(post._id))
    dispatch(fetchPostComments(post._id))
  }, [dispatch, post._id])

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
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
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!authorId || followStatus === 'loading') {
      return
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
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
