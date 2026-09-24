// Отображает один комментарий к публикации с датой, лайками и возможностью удаления
// для его автора, получая и обновляя состояние лайков через Redux.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { useEffect, useState } from 'react'
import {
  fetchCommentLikes,
  toggleCommentLike,
} from '../../like/model/likesCommentThunks'
import { useAppDispatch, useAppSelector } from '../../../app/providers/hooks'
import type { Comment } from '../types/comment'
import styles from '../../../widgets/post-preview/PostPreviewModal.module.css'

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || ''

// Возвращает вычисленные данные: AgeLabel.
const getAgeLabel = (createdAt: string) => {
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  )

  if (diffMinutes < 60) {
    return `${diffMinutes}m`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours}h`
  }

  const diffDays = Math.floor(diffHours / 24)

  return diffDays === 1 ? '1 day' : `${diffDays} days`
}

type CommentRowProps = {
  comment: Comment
  currentUserId: string
  onDeleteComment: (commentId: string) => void
}

// Выполняет логику CommentRow в текущем модуле.
function CommentRow({
  comment,
  currentUserId,
  onDeleteComment,
}: CommentRowProps) {
  const dispatch = useAppDispatch()
  const [likedOverride, setLikedOverride] = useState<{
    commentId: string
    value: boolean
  } | null>(null)
  const commentLikes = useAppSelector(
    (state) => state.commentLikes.byCommentId[comment._id],
  )
  const likesCount = commentLikes?.count ?? 0
  const isCommentLikedFromServer =
    commentLikes?.likes.some(
      (like) => getUserId(like.user) === currentUserId,
    ) ?? false
  const isCommentLiked =
    likedOverride?.commentId === comment._id
      ? likedOverride.value
      : isCommentLikedFromServer

  useEffect(() => {
    dispatch(fetchCommentLikes(comment._id))
  }, [comment._id, dispatch])

  // Обрабатывает действие пользователя: ToggleLike.
  const handleToggleLike = () => {
    setLikedOverride({ commentId: comment._id, value: !isCommentLiked })
    dispatch(toggleCommentLike(comment._id))
  }

  return (
    <div className={styles.captionRow}>
      <span className={styles.avatarRing}>
        <img src={comment.user.avatar || '/icons/ICH_avatar.png'} alt="" />
      </span>

      <p>
        <strong>{comment.user.username}</strong> {comment.text}
        <span className={styles.commentMeta}>
          <time dateTime={comment.createdAt}>
            {getAgeLabel(comment.createdAt)}
          </time>
          <span>Likes: {likesCount}</span>
          {getUserId(comment.user) === currentUserId && (
            <button
              className={styles.deleteCommentButton}
              type="button"
              onClick={() => onDeleteComment(comment._id)}>
              Delete
            </button>
          )}
        </span>
      </p>

      <button
        className={`${styles.commentLikeButton} ${
          isCommentLiked ? styles.likedButton : ''
        }`}
        type="button"
        aria-label={isCommentLiked ? 'Unlike comment' : 'Like comment'}
        onClick={handleToggleLike}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M16.8 3.8c-1.8 0-3.3 1-4.2 2.4C11.7 4.8 10.2 3.8 8.4 3.8 5.5 3.8 3.2 6 3.2 8.8c0 5.2 8.8 10.4 9.2 10.6.1.1.3.1.4 0 .4-.2 9.2-5.4 9.2-10.6 0-2.8-2.3-5-5.2-5Z" />
        </svg>
      </button>
    </div>
  )
}

export default CommentRow
