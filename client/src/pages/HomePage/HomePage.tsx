// Отображает главную ленту публикаций: загружает посты, показывает их карточки
// и открывает выбранную публикацию в модальном окне.
import { useEffect, useState } from 'react'
import PostCard from '../../entities/post/ui/PostCard'
import PostPreviewModal from '../../widgets/post-preview/PostPreviewModal'
import Spinner from '../../shared/ui/spinner/Spinner'
import { fetchAllPosts } from '../../entities/post/model/postsThunks'
import { useAppDispatch, useAppSelector } from '../../app/providers/hooks'
import type { Post } from '../../entities/post/types/post'
import styles from './HomePage.module.css'

function HomePage() {
  const dispatch = useAppDispatch()
  const { allPosts, feedStatus, error } = useAppSelector((state) => state.posts)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  useEffect(() => {
    dispatch(fetchAllPosts())
  }, [dispatch])

  if (feedStatus === 'idle' || feedStatus === 'loading') {
    return <Spinner label="Loading posts..." />
  }

  if (feedStatus === 'failed') {
    return <p className={styles.errorText}>{error}</p>
  }

  if (feedStatus === 'succeeded' && allPosts.length === 0) {
    return <p className={styles.stateText}>No posts yet.</p>
  }

  return (
    <section className={styles.page}>
      <div className={styles.feedGrid}>
        {allPosts.map((post) => (
          <PostCard key={post._id} post={post} onOpenPost={setSelectedPost} />
        ))}
      </div>

      <div className={styles.updates}>
        <img
          className={styles.checkIcon}
          src="/icons/seen_all_updates.png"
          alt=""
          aria-hidden="true"
        />
        <p className={styles.updatesTitle}>You&apos;ve seen all the updates</p>
        <p className={styles.updatesText}>
          You have viewed all new publications
        </p>
      </div>

      {selectedPost && (
        <PostPreviewModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </section>
  )
}

export default HomePage
