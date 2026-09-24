// Возвращает список изображений публикации и её основную обложку,
// поддерживая старый формат с одним изображением и новый — с несколькими.
import type { Post } from '../../entities/post/types/post'

export const getPostImages = (post: Post) => {
  if (post.images && post.images.length > 0) {
    return post.images
  }

  return post.image ? [post.image] : []
}

export const getPostCoverImage = (post: Post) => getPostImages(post)[0] ?? ''
