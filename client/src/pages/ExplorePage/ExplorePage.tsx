// Отображает ленту Explore с публикациями, открывает выбранный пост в модальном окне
// и позволяет подписываться или отписываться от автора открытого поста.
// Основные части: данные, локальное состояние и отображение страницы.
import { useEffect, useState } from 'react'
import PostPreviewModal from '../../widgets/post-preview/PostPreviewModal'
import Spinner from '../../shared/ui/spinner/Spinner'
import { fetchExplorePosts } from '../../entities/post/model/postsThunks'
import { fetchMyProfile } from '../../entities/user/model/profileThunks'
import {
  fetchSubscriptionSummary,
  followUser,
  unfollowUser,
} from '../../entities/subscription/model/subscriptionsThunks'
import { useAppDispatch, useAppSelector } from '../../app/providers/hooks'
import { getPostCoverImage } from '../../shared/lib/postImages'
import styles from './ExplorePage.module.css'

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || ''

// Выполняет логику ExplorePage в текущем модуле.
function ExplorePage() {
  const dispatch = useAppDispatch()
  const { explorePosts, status, error } = useAppSelector((state) => state.posts)
  const { myProfile } = useAppSelector((state) => state.profile)
  const { byUserId, followStatus } = useAppSelector(
    (state) => state.subscriptions,
  )
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null,
  )
  const selectedPost =
    selectedPostIndex === null
      ? null
      : (explorePosts[selectedPostIndex] ?? null)
  const currentUserId = getUserId(myProfile)
  const selectedAuthorId = getUserId(selectedPost?.author)
  const isOwnPost = Boolean(
    currentUserId && selectedAuthorId && currentUserId === selectedAuthorId,
  )
  const subscriptionSummary = selectedAuthorId
    ? byUserId[selectedAuthorId]
    : undefined
  const isFollowingAuthor = subscriptionSummary?.isFollowing ?? false

  useEffect(() => {
    dispatch(fetchExplorePosts())
  }, [dispatch])

  useEffect(() => {
    if (!myProfile) {
      dispatch(fetchMyProfile())
    }
  }, [dispatch, myProfile])

  useEffect(() => {
    if (!selectedAuthorId || !currentUserId || isOwnPost) {
      return
    }

    dispatch(
      fetchSubscriptionSummary({
        userId: selectedAuthorId,
        currentUserId,
      }),
    )
  }, [currentUserId, dispatch, isOwnPost, selectedAuthorId])

  // Обрабатывает действие пользователя: ToggleFollowAuthor.
  const handleToggleFollowAuthor = () => {
    if (!selectedAuthorId || followStatus === 'loading' || isOwnPost) {
      return
    }

    if (isFollowingAuthor) {
      dispatch(unfollowUser(selectedAuthorId))
      return
    }

    dispatch(followUser(selectedAuthorId))
  }

  if (status === 'loading') {
    return <Spinner label="Loading posts..." />
  }

  if (status === 'failed') {
    return <p className={styles.errorText}>{error}</p>
  }

  if (status === 'succeeded' && explorePosts.length === 0) {
    return <p className={styles.stateText}>No posts yet.</p>
  }

  return (
    <section className={styles.page} aria-label="Explore posts">
      <div className={styles.grid}>
        {/* Это логика, которая назначает разным картинкам разные размеры в сетке Explore */}
        {explorePosts.map((post, index) => (
          <button
            className={`${styles.tile} ${
              index % 7 === 2 || index % 7 === 5 ? styles.tall : ''
            } ${index % 11 === 6 ? styles.wide : ''}`}
            key={post._id}
            type="button"
            onClick={() => setSelectedPostIndex(index)}>
            <img
              className={styles.image}
              src={getPostCoverImage(post)}
              alt={post.description || `${post.author.username} post`}
            />
          </button>
        ))}
      </div>

      {selectedPost && (
        <PostPreviewModal
          post={selectedPost}
          onClose={() => setSelectedPostIndex(null)}
          showFollowButton={!isOwnPost}
          isFollowingAuthor={isFollowingAuthor}
          isFollowLoading={followStatus === 'loading'}
          onToggleFollowAuthor={handleToggleFollowAuthor}
          onPrevious={() =>
            setSelectedPostIndex((currentIndex) => {
              if (currentIndex === null) {
                return currentIndex
              }

              return currentIndex === 0
                ? explorePosts.length - 1
                : currentIndex - 1
            })
          }
          onNext={() =>
            setSelectedPostIndex((currentIndex) => {
              if (currentIndex === null) {
                return currentIndex
              }

              return currentIndex === explorePosts.length - 1
                ? 0
                : currentIndex + 1
            })
          }
        />
      )}
    </section>
  )
}

export default ExplorePage
