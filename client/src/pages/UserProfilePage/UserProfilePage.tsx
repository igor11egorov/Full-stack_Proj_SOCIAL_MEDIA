// Отображает профиль другого пользователя с его публикациями и подписками,
// а также позволяет просматривать посты и управлять подпиской на этого пользователя.
import axios from 'axios'
import {
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PostPreviewModal from '../../widgets/post-preview/PostPreviewModal'
import SubscriptionsModal from '../../widgets/subscriptions/SubscriptionsModal'
import Spinner from '../../shared/ui/spinner/Spinner'
import { fetchMyProfile } from '../../entities/user/model/profileThunks'
import {
  fetchSubscriptionSummary,
  fetchUserFollowers,
  fetchUserFollowing,
  followUser,
  unfollowUser,
} from '../../entities/subscription/model/subscriptionsThunks'
import { useAppDispatch, useAppSelector } from '../../app/providers/hooks'
import type { Post } from '../../entities/post/types/post'
import type { User } from '../../entities/user/types/user'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { getPostCoverImage, getPostImages } from '../../shared/lib/postImages'
import styles from './UserProfilePage.module.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type UserResponse = {
  success: boolean
  user: User
}

type PostsResponse = {
  success: boolean
  posts: Post[]
}

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || ''

// Выполняет логику UserProfilePage в текущем модуле.
function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { myProfile } = useAppSelector((state) => state.profile)
  const {
    byUserId,
    followersByUserId,
    followingByUserId,
    listStatus,
    followStatus,
    error: subscriptionError,
  } = useAppSelector((state) => state.subscriptions)
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [profileStatus, setProfileStatus] = useState<
    'idle' | 'loading' | 'succeeded' | 'failed'
  >('idle')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null,
  )
  const [subscriptionsModal, setSubscriptionsModal] = useState<
    'followers' | 'following' | null
  >(null)
  const selectedPost =
    selectedPostIndex === null ? null : (posts[selectedPostIndex] ?? null)
  const currentUserId = getUserId(myProfile)
  const subscriptionSummary = userId ? byUserId[userId] : undefined
  const followersCount = subscriptionSummary?.followersCount ?? 0
  const followingCount = subscriptionSummary?.followingCount ?? 0
  const isFollowing = subscriptionSummary?.isFollowing ?? false
  const followersList = userId ? (followersByUserId[userId] ?? []) : []
  const followingList = userId ? (followingByUserId[userId] ?? []) : []

  useEffect(() => {
    if (!myProfile) {
      dispatch(fetchMyProfile())
    }
  }, [dispatch, myProfile])

  useEffect(() => {
    if (!userId) {
      return
    }

    if (currentUserId && userId === currentUserId) {
      navigate('/profile', { replace: true })
      return
    }

    // Выполняет логику loadProfile в текущем модуле.
    const loadProfile = async () => {
      try {
        setProfileStatus('loading')
        setProfileError(null)

        const [userResponse, postsResponse] = await Promise.all([
          axios.get<UserResponse>(`${API_URL}/api/users/${userId}`),
          axios.get<PostsResponse>(`${API_URL}/api/posts/user/${userId}`),
        ])

        setUser(userResponse.data.user)
        setPosts(postsResponse.data.posts)
        setProfileStatus('succeeded')
      } catch (requestError: unknown) {
        setProfileStatus('failed')
        setProfileError(
          getErrorMessage(requestError, 'Failed to load user profile'),
        )
      }
    }

    loadProfile()
  }, [currentUserId, navigate, userId])

  useEffect(() => {
    if (userId && currentUserId && userId !== currentUserId) {
      dispatch(fetchSubscriptionSummary({ userId, currentUserId }))
    }
  }, [currentUserId, dispatch, userId])

  useEffect(() => {
    if (!userId || !subscriptionsModal) {
      return
    }

    if (subscriptionsModal === 'followers') {
      dispatch(fetchUserFollowers(userId))
      return
    }

    dispatch(fetchUserFollowing(userId))
  }, [dispatch, subscriptionsModal, userId])

  // Обрабатывает действие пользователя: ToggleFollow.
  const handleToggleFollow = async () => {
    if (!userId || followStatus === 'loading') {
      return
    }

    if (isFollowing) {
      dispatch(unfollowUser(userId))
      return
    }

    dispatch(followUser(userId))
  }

  // Обрабатывает действие пользователя: OpenMessages.
  const handleOpenMessages = () => {
    if (!userId || !user) {
      return
    }

    navigate('/messages')
  }

  const handleStatKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    modal: 'followers' | 'following',
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSubscriptionsModal(modal)
    }
  }

  if (profileStatus === 'idle' || profileStatus === 'loading') {
    return <Spinner label="Loading profile..." />
  }

  if (profileStatus === 'failed') {
    return <p className={styles.errorText}>{profileError}</p>
  }

  if (!user) {
    return <p className={styles.stateText}>Profile not found.</p>
  }

  const avatar = user.avatar || '/icons/ICH_avatar.png'
  const bio = user.bio?.trim()
  const website = user.website?.trim()
  const websiteHref =
    website && (website.startsWith('http') ? website : `https://${website}`)

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.avatarRing}>
          <img className={styles.avatar} src={avatar} alt="" />
        </div>

        <div className={styles.info}>
          <div className={styles.topRow}>
            <h1 className={styles.username}>{user.username}</h1>
            <button
              className={`${styles.followButton} ${
                isFollowing ? styles.followingButton : ''
              }`}
              type="button"
              disabled={followStatus === 'loading'}
              onClick={handleToggleFollow}>
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button
              className={styles.messageButton}
              type="button"
              onClick={handleOpenMessages}>
              Message
            </button>
          </div>

          <dl className={styles.stats}>
            <div>
              <dt>{posts.length}</dt>
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

          {user.fullName && <p className={styles.fullName}>{user.fullName}</p>}
          {bio && <p className={styles.bio}>{bio}</p>}
          {website && (
            <a className={styles.website} href={websiteHref}>
              {website}
            </a>
          )}
        </div>
      </header>

      {subscriptionError && (
        <p className={styles.inlineError}>{subscriptionError}</p>
      )}

      {posts.length > 0 ? (
        <div className={styles.postsGrid}>
          {posts.map((post, index) => (
            <button
              className={styles.postTile}
              type="button"
              key={post._id}
              onClick={() => setSelectedPostIndex(index)}>
              <img src={getPostCoverImage(post)} alt={post.description || ''} />
              {getPostImages(post).length > 1 && (
                <span className={styles.galleryBadge}>
                  1/{getPostImages(post).length}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.stateText}>No posts yet.</p>
      )}

      {selectedPost && (
        <PostPreviewModal
          post={selectedPost}
          onClose={() => setSelectedPostIndex(null)}
          showFollowButton
          isFollowingAuthor={isFollowing}
          isFollowLoading={followStatus === 'loading'}
          onToggleFollowAuthor={handleToggleFollow}
          onPrevious={() =>
            setSelectedPostIndex((currentIndex) => {
              if (currentIndex === null) {
                return currentIndex
              }

              return currentIndex === 0 ? posts.length - 1 : currentIndex - 1
            })
          }
          onNext={() =>
            setSelectedPostIndex((currentIndex) => {
              if (currentIndex === null) {
                return currentIndex
              }

              return currentIndex === posts.length - 1 ? 0 : currentIndex + 1
            })
          }
        />
      )}

      {subscriptionsModal && (
        <SubscriptionsModal
          title={subscriptionsModal === 'followers' ? 'Followers' : 'Following'}
          users={
            subscriptionsModal === 'followers' ? followersList : followingList
          }
          isLoading={listStatus === 'loading'}
          error={subscriptionError}
          onClose={() => setSubscriptionsModal(null)}
        />
      )}
    </section>
  )
}

export default UserProfilePage
