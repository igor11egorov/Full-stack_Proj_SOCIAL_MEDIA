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

// Хранит значение «getUserId», необходимое для текущего логического блока.
const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || ''

// Возвращает вычисленные данные: AgeLabel.
const getAgeLabel = (createdAt: string) => {
  // Хранит значение «diffMinutes», необходимое для текущего логического блока.
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  )

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (diffMinutes < 60) {
    return `${diffMinutes}m`
  }

  // Хранит значение «diffHours», необходимое для текущего логического блока.
  const diffHours = Math.floor(diffMinutes / 60)

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (diffHours < 24) {
    return `${diffHours}h`
  }

  // Хранит значение «diffDays», необходимое для текущего логического блока.
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
  // Хранит значение «dispatch», необходимое для текущего логического блока.
  const dispatch = useAppDispatch()
  const [likedOverride, setLikedOverride] = useState<{
    commentId: string
    value: boolean
  } | null>(null)
  // Хранит значение «commentLikes», необходимое для текущего логического блока.
  const commentLikes = useAppSelector(
    (state) => state.commentLikes.byCommentId[comment._id],
  )
  // Задаёт ограничение, используемое при проверке или отображении данных.
  const likesCount = commentLikes?.count ?? 0
  // Хранит результат проверки условия для последующей логики интерфейса.
  const isCommentLikedFromServer =
    commentLikes?.likes.some(
      (like) => getUserId(like.user) === currentUserId,
    ) ?? false
  // Хранит результат проверки условия для последующей логики интерфейса.
  const isCommentLiked =
    likedOverride?.commentId === comment._id
      ? likedOverride.value
      : isCommentLikedFromServer

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
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
