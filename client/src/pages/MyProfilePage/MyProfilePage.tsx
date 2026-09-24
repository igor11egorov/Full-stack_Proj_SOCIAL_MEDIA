// Отображает профиль текущего пользователя с его публикациями, подписками и лайками,
// а также поддерживает просмотр, удаление и редактирование собственных постов.
// Основные части: данные, локальное состояние и отображение страницы.
import {
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SubscriptionsModal from '../../widgets/subscriptions/SubscriptionsModal'
import Spinner from '../../shared/ui/spinner/Spinner'
import {
  fetchPostLikes,
  togglePostLike,
} from '../../entities/like/model/likesThunks'
import { deletePost } from '../../entities/post/model/postsThunks'
import {
  fetchMyPosts,
  fetchMyProfile,
} from '../../entities/user/model/profileThunks'
import {
  fetchSubscriptionSummary,
  fetchUserFollowers,
  fetchUserFollowing,
  unfollowUser,
} from '../../entities/subscription/model/subscriptionsThunks'
import { useAppDispatch, useAppSelector } from '../../app/providers/hooks'
import type { Post } from '../../entities/post/types/post'
import { getPostCoverImage, getPostImages } from '../../shared/lib/postImages'
import styles from './MyProfilePage.module.css'

// Хранит значение «getUserId», необходимое для текущего логического блока.
const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null,
) => user?._id || user?.userId || user?.id || ''
// Задаёт ограничение, используемое при проверке или отображении данных.
const collapsedBioLength = 120

// Возвращает вычисленные данные: PostAgeLabel.
const getPostAgeLabel = (createdAt: string) => {
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

// Выполняет логику MyProfilePage в текущем модуле.
function MyProfilePage() {
  // Хранит значение «dispatch», необходимое для текущего логического блока.
  const dispatch = useAppDispatch()
  // Хранит значение «navigate», необходимое для текущего логического блока.
  const navigate = useNavigate()
  const { myProfile, myPosts, status, postsStatus, error } = useAppSelector(
    (state) => state.profile,
  )
  const {
    byUserId: subscriptionsByUserId,
    followersByUserId,
    followingByUserId,
    followStatus,
    listStatus,
    error: subscriptionsError,
  } = useAppSelector((state) => state.subscriptions)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null,
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [likedOverride, setLikedOverride] = useState<{
    postId: string
    value: boolean
  } | null>(null)
  const [subscriptionsModal, setSubscriptionsModal] = useState<
    'followers' | 'following' | null
  >(null)
  // Хранит значение «myProfileId», необходимое для текущего логического блока.
  const myProfileId = getUserId(myProfile)

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    dispatch(fetchMyProfile())
  }, [dispatch])

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    // Хранит значение «userId», необходимое для текущего логического блока.
    const userId = getUserId(myProfile)

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (userId) {
      dispatch(fetchMyPosts(userId))
      dispatch(fetchSubscriptionSummary({ userId, currentUserId: userId }))
    }
  }, [dispatch, myProfile])

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!myProfileId || !subscriptionsModal) {
      return
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (subscriptionsModal === 'followers') {
      dispatch(fetchUserFollowers(myProfileId))
      return
    }

    dispatch(fetchUserFollowing(myProfileId))
  }, [dispatch, myProfileId, subscriptionsModal])

  // Хранит значение «selectedPostLikes», необходимое для текущего логического блока.
  const selectedPostLikes = useAppSelector((state) =>
    selectedPost ? state.likes.byPostId[selectedPost._id] : undefined,
  )
  // Задаёт ограничение, используемое при проверке или отображении данных.
  const selectedPostLikesCount = selectedPostLikes?.count ?? 0
  // Хранит результат проверки условия для последующей логики интерфейса.
  const isSelectedPostLikedFromServer =
    selectedPostLikes?.likes.some(
      (like) => getUserId(like.user) === myProfileId,
    ) ?? false
  // Хранит результат проверки условия для последующей логики интерфейса.
  const isSelectedPostLiked =
    likedOverride && selectedPost && likedOverride.postId === selectedPost._id
      ? likedOverride.value
      : isSelectedPostLikedFromServer
  // Хранит значение «selectedPostLikesLabel», необходимое для текущего логического блока.
  const selectedPostLikesLabel = `${selectedPostLikesCount} ${
    selectedPostLikesCount === 1 ? 'like' : 'likes'
  }`

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!selectedPost) {
      return
    }

    dispatch(fetchPostLikes(selectedPost._id))
  }, [dispatch, selectedPost])

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    // Обрабатывает действие пользователя: KeyDown.
    const handleKeyDown = (event: KeyboardEvent) => {
      // Проверяет условие и выбирает дальнейший сценарий выполнения.
      if (event.key === 'Escape') {
        setIsPostMenuOpen(false)
        setSelectedPost(null)
        setSelectedPostIndex(null)
        setSelectedImageIndex(0)
        return
      }

      // Проверяет условие и выбирает дальнейший сценарий выполнения.
      if (selectedPostIndex === null || myPosts.length < 2 || isPostMenuOpen) {
        return
      }

      // Проверяет условие и выбирает дальнейший сценарий выполнения.
      if (event.key === 'ArrowLeft') {
        // Хранит значение «nextIndex», необходимое для текущего логического блока.
        const nextIndex =
          selectedPostIndex === 0 ? myPosts.length - 1 : selectedPostIndex - 1

        setSelectedPost(myPosts[nextIndex])
        setSelectedPostIndex(nextIndex)
        setSelectedImageIndex(0)
      }

      // Проверяет условие и выбирает дальнейший сценарий выполнения.
      if (event.key === 'ArrowRight') {
        // Хранит значение «nextIndex», необходимое для текущего логического блока.
        const nextIndex =
          selectedPostIndex === myPosts.length - 1 ? 0 : selectedPostIndex + 1

        setSelectedPost(myPosts[nextIndex])
        setSelectedPostIndex(nextIndex)
        setSelectedImageIndex(0)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPostMenuOpen, myPosts, selectedPostIndex])

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (status === 'loading') {
    return <Spinner label="Loading profile..." />
  }

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (status === 'failed') {
    return <p className={styles.errorText}>{error}</p>
  }

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (!myProfile) {
    return <p className={styles.stateText}>Profile not found.</p>
  }

  // Хранит значение «avatar», необходимое для текущего логического блока.
  const avatar = myProfile.avatar || '/icons/ICH_avatar.png'
  // Хранит значение «bio», необходимое для текущего логического блока.
  const bio = myProfile.bio?.trim()
  // Хранит результат проверки условия для последующей логики интерфейса.
  const isBioLong = Boolean(bio && bio.length > collapsedBioLength)
  // Хранит значение «website», необходимое для текущего логического блока.
  const website = myProfile.website?.trim()
  // Хранит значение «websiteHref», необходимое для текущего логического блока.
  const websiteHref =
    website && (website.startsWith('http') ? website : `https://${website}`)
  // Хранит значение «selectedPostAuthor», необходимое для текущего логического блока.
  const selectedPostAuthor = selectedPost?.author || myProfile
  // Хранит значение «selectedPostAvatar», необходимое для текущего логического блока.
  const selectedPostAvatar = selectedPostAuthor?.avatar || avatar
  // Хранит значение «selectedPostUsername», необходимое для текущего логического блока.
  const selectedPostUsername =
    selectedPostAuthor?.username || myProfile.username
  // Хранит значение «selectedPostImages», необходимое для текущего логического блока.
  const selectedPostImages = selectedPost ? getPostImages(selectedPost) : []
  // Хранит значение «selectedPostImage», необходимое для текущего логического блока.
  const selectedPostImage =
    selectedPostImages[selectedImageIndex] || selectedPostImages[0] || ''
  // Хранит значение «hasMultipleSelectedImages», необходимое для текущего логического блока.
  const hasMultipleSelectedImages = selectedPostImages.length > 1
  // Хранит значение «subscriptionSummary», необходимое для текущего логического блока.
  const subscriptionSummary = subscriptionsByUserId[myProfileId]
  // Задаёт ограничение, используемое при проверке или отображении данных.
  const followersCount = subscriptionSummary?.followersCount ?? 0
  // Задаёт ограничение, используемое при проверке или отображении данных.
  const followingCount = subscriptionSummary?.followingCount ?? 0
  // Хранит значение «followersList», необходимое для текущего логического блока.
  const followersList = followersByUserId[myProfileId] ?? []
  // Хранит значение «followingList», необходимое для текущего логического блока.
  const followingList = followingByUserId[myProfileId] ?? []

  // Хранит значение «handleStatKeyDown», необходимое для текущего логического блока.
  const handleStatKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    modal: 'followers' | 'following',
  ) => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSubscriptionsModal(modal)
    }
  }

  // Обрабатывает действие пользователя: CopyLink.
  const handleCopyLink = async () => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!selectedPost) {
      return
    }

    // Хранит значение «postUrl», необходимое для текущего логического блока.
    const postUrl = `${window.location.origin}/posts/${selectedPost._id}`
    await navigator.clipboard.writeText(postUrl)
    setCopyStatus('copied')
  }

  // Обрабатывает действие пользователя: UnfollowFromList.
  const handleUnfollowFromList = async (userId: string) => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!myProfileId || followStatus === 'loading') {
      return
    }

    // Хранит значение «result», необходимое для текущего логического блока.
    const result = await dispatch(unfollowUser(userId))

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!unfollowUser.fulfilled.match(result)) {
      return
    }

    dispatch(fetchUserFollowing(myProfileId))
  }

  // Обрабатывает действие пользователя: DeletePost.
  const handleDeletePost = async () => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!selectedPost) {
      return
    }

    // Хранит значение «postId», необходимое для текущего логического блока.
    const postId = selectedPost._id
    // Хранит значение «result», необходимое для текущего логического блока.
    const result = await dispatch(deletePost(postId))

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!deletePost.fulfilled.match(result)) {
      return
    }

    // Хранит значение «remainingPosts», необходимое для текущего логического блока.
    const remainingPosts = myPosts.filter((post) => post._id !== postId)
    setIsPostMenuOpen(false)

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (remainingPosts.length === 0) {
      setSelectedPost(null)
      setSelectedPostIndex(null)
      return
    }

    // Хранит значение «nextIndex», необходимое для текущего логического блока.
    const nextIndex = Math.min(
      selectedPostIndex ?? 0,
      remainingPosts.length - 1,
    )
    setSelectedPost(remainingPosts[nextIndex])
    setSelectedPostIndex(nextIndex)
    setSelectedImageIndex(0)
  }

  // Обрабатывает действие пользователя: ToggleSelectedPostLike.
  const handleToggleSelectedPostLike = () => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!selectedPost) {
      return
    }

    setLikedOverride({ postId: selectedPost._id, value: !isSelectedPostLiked })
    dispatch(togglePostLike(selectedPost._id))
  }

  // Отображает нужный элемент: PreviousSelectedImage.
  const showPreviousSelectedImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? selectedPostImages.length - 1 : currentIndex - 1,
    )
  }

  // Отображает нужный элемент: NextSelectedImage.
  const showNextSelectedImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === selectedPostImages.length - 1 ? 0 : currentIndex + 1,
    )
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.avatarRing}>
          <img className={styles.avatar} src={avatar} alt="" />
        </div>

        <div className={styles.info}>
          <div className={styles.topRow}>
            <h1 className={styles.username}>{myProfile.username}</h1>
            <Link className={styles.editButton} to="/profile/edit">
              Edit profile
            </Link>
          </div>

          <dl className={styles.stats}>
            <div>
              <dt>{myPosts.length}</dt>
              <dd>posts</dd>
            </div>
            <div
              className={styles.statAction}
              role="button"
              tabIndex={0}
              onClick={() => setSubscriptionsModal('followers')}
              onKeyDown={(event) => handleStatKeyDown(event, 'followers')}>
              <dt>{followersCount}</dt>
              <dd>followers</dd>
            </div>
            <div
              className={styles.statAction}
              role="button"
              tabIndex={0}
              onClick={() => setSubscriptionsModal('following')}
              onKeyDown={(event) => handleStatKeyDown(event, 'following')}>
              <dt>{followingCount}</dt>
              <dd>following</dd>
            </div>
          </dl>

          {subscriptionsError && (
            <p className={styles.subscriptionError}>{subscriptionsError}</p>
          )}

          {bio && (
            <p className={styles.bio}>
              {isBioLong ? `${bio.slice(0, collapsedBioLength)}...` : bio}
              {isBioLong && <span> more</span>}
            </p>
          )}

          {website && (
            <a className={styles.website} href={websiteHref}>
              {website}
            </a>
          )}
        </div>
      </header>

      {postsStatus === 'loading' && <Spinner label="Loading posts..." />}

      {postsStatus === 'failed' && <p className={styles.errorText}>{error}</p>}

      {postsStatus === 'succeeded' && myPosts.length === 0 && (
        <div className={styles.emptyPosts}>
          <Link
            className={styles.newPostButton}
            to="/create"
            aria-label="Create post">
            <span aria-hidden="true" />
          </Link>
          <p>New</p>
          <span>No posts yet.</span>
        </div>
      )}

      {myPosts.length > 0 && (
        <div className={styles.postsGrid}>
          {myPosts.map((post, index) => (
            <button
              className={styles.postTile}
              type="button"
              key={post._id}
              onClick={() => {
                setSelectedPost(post)
                setSelectedPostIndex(index)
                setSelectedImageIndex(0)
                setIsPostMenuOpen(false)
                setCopyStatus('idle')
              }}>
              <img
                src={getPostCoverImage(post)}
                alt={post.description || 'Profile post'}
              />
              {getPostImages(post).length > 1 && (
                <span className={styles.galleryBadge}>
                  1/{getPostImages(post).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedPost && (
        <div className={styles.postOverlay}>
          <button
            className={styles.postBackdrop}
            type="button"
            aria-label="Close post"
            onClick={() => {
              setSelectedPost(null)
              setSelectedPostIndex(null)
              setSelectedImageIndex(0)
              setIsPostMenuOpen(false)
            }}
          />

          {myPosts.length > 1 && selectedPostIndex !== null && (
            <>
              <button
                className={`${styles.navButton} ${styles.navButtonLeft}`}
                type="button"
                aria-label="Previous post"
                onClick={() => {
                  // Хранит значение «nextIndex», необходимое для текущего логического блока.
                  const nextIndex =
                    selectedPostIndex === 0
                      ? myPosts.length - 1
                      : selectedPostIndex - 1

                  setSelectedPost(myPosts[nextIndex])
                  setSelectedPostIndex(nextIndex)
                  setSelectedImageIndex(0)
                  setIsPostMenuOpen(false)
                  setCopyStatus('idle')
                }}>
                &lt;
              </button>
              <button
                className={`${styles.navButton} ${styles.navButtonRight}`}
                type="button"
                aria-label="Next post"
                onClick={() => {
                  // Хранит значение «nextIndex», необходимое для текущего логического блока.
                  const nextIndex =
                    selectedPostIndex === myPosts.length - 1
                      ? 0
                      : selectedPostIndex + 1

                  setSelectedPost(myPosts[nextIndex])
                  setSelectedPostIndex(nextIndex)
                  setSelectedImageIndex(0)
                  setIsPostMenuOpen(false)
                  setCopyStatus('idle')
                }}>
                &gt;
              </button>
            </>
          )}

          <article className={styles.postModal}>
            <div className={styles.postImageWrap}>
              <img
                className={styles.postModalImage}
                src={selectedPostImage}
                alt={selectedPost.description || 'Selected post'}
              />
              {hasMultipleSelectedImages && (
                <>
                  <button
                    className={`${styles.imageNavButton} ${styles.imageNavButtonLeft}`}
                    type="button"
                    aria-label="Previous image"
                    onClick={showPreviousSelectedImage}>
                    &lt;
                  </button>
                  <button
                    className={`${styles.imageNavButton} ${styles.imageNavButtonRight}`}
                    type="button"
                    aria-label="Next image"
                    onClick={showNextSelectedImage}>
                    &gt;
                  </button>
                  <span className={styles.imageCounter}>
                    {selectedImageIndex + 1}/{selectedPostImages.length}
                  </span>
                </>
              )}
            </div>

            <div className={styles.postDetails}>
              <header className={styles.postModalHeader}>
                <div className={styles.postAuthor}>
                  <span className={styles.postAuthorRing}>
                    <img src={selectedPostAvatar} alt="" />
                  </span>
                  <strong>{selectedPostUsername}</strong>
                </div>

                <button
                  className={styles.dotsButton}
                  type="button"
                  aria-label="Post settings"
                  onClick={() => setIsPostMenuOpen(true)}>
                  ...
                </button>
              </header>

              <div className={styles.postTextArea}>
                <div className={styles.postCaptionRow}>
                  <span className={styles.postAuthorRing}>
                    <img src={selectedPostAvatar} alt="" />
                  </span>
                  <p>
                    <strong>{selectedPostUsername}</strong>{' '}
                    {selectedPost.description}
                  </p>
                </div>
              </div>

              <footer className={styles.postModalFooter}>
                <div className={styles.postActions}>
                  <button
                    className={`${styles.actionButton} ${
                      isSelectedPostLiked ? styles.likedButton : ''
                    }`}
                    type="button"
                    aria-label={
                      isSelectedPostLiked ? 'Unlike post' : 'Like post'
                    }
                    onClick={handleToggleSelectedPostLike}>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false">
                      <path d="M16.8 3.8c-1.8 0-3.3 1-4.2 2.4C11.7 4.8 10.2 3.8 8.4 3.8 5.5 3.8 3.2 6 3.2 8.8c0 5.2 8.8 10.4 9.2 10.6.1.1.3.1.4 0 .4-.2 9.2-5.4 9.2-10.6 0-2.8-2.3-5-5.2-5Z" />
                    </svg>
                  </button>
                  <img
                    src="/icons/button-comments.png"
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <strong>{selectedPostLikesLabel}</strong>
                <time dateTime={selectedPost.createdAt}>
                  {getPostAgeLabel(selectedPost.createdAt)}
                </time>
              </footer>

              <div className={styles.commentBar}>
                <img src="/icons/smile_btn.png" alt="" aria-hidden="true" />
                <span>Add comment</span>
                <button type="button">Send</button>
              </div>
            </div>
          </article>

          {isPostMenuOpen && (
            <>
              <button
                className={styles.menuBackdrop}
                type="button"
                aria-label="Close post menu"
                onClick={() => setIsPostMenuOpen(false)}
              />
              <div
                className={styles.postMenu}
                role="dialog"
                aria-label="Post menu">
                <button
                  className={styles.deleteAction}
                  type="button"
                  onClick={handleDeletePost}>
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/posts/${selectedPost._id}/edit`)}>
                  Edit
                </button>
                <button type="button" onClick={handleCopyLink}>
                  {copyStatus === 'copied' ? 'Copied!' : 'Copy link'}
                </button>
                <button type="button" onClick={() => setIsPostMenuOpen(false)}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {subscriptionsModal && (
        <SubscriptionsModal
          title={subscriptionsModal === 'followers' ? 'Followers' : 'Following'}
          users={
            subscriptionsModal === 'followers' ? followersList : followingList
          }
          isLoading={listStatus === 'loading'}
          isActionLoading={followStatus === 'loading'}
          error={subscriptionsError}
          showUnfollowButton={subscriptionsModal === 'following'}
          onUnfollowUser={handleUnfollowFromList}
          onClose={() => setSubscriptionsModal(null)}
        />
      )}
    </section>
  )
}

export default MyProfilePage
