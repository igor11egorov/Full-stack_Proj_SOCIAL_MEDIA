// Возвращает список изображений публикации и её основную обложку,
// поддерживая старый формат с одним изображением и новый — с несколькими.
// Основные части: переиспользуемая логика без привязки к сценарию.
import type { Post } from '../../entities/post/types/post'

// Возвращает вычисленные данные: PostImages.
export const getPostImages = (post: Post) => {
  if (post.images && post.images.length > 0) {
    return post.images
  }

  return post.image ? [post.image] : []
}

// Возвращает вычисленные данные: PostCoverImage.
export const getPostCoverImage = (post: Post) => getPostImages(post)[0] ?? ''
