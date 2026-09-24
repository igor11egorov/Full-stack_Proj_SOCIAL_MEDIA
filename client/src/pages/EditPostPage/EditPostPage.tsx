// Отображает форму редактирования публикации: загружает пост, позволяет изменить описание
// и изображения, проверяет ограничения и отправляет обновлённые данные на сервер.
// Основные части: данные, локальное состояние и отображение страницы.
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react'
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Spinner from '../../shared/ui/spinner/Spinner'
import { fetchPostById, updatePost } from '../../entities/post/model/postsThunks'
import { fetchMyProfile } from '../../entities/user/model/profileThunks'
import { useAppDispatch, useAppSelector } from '../../app/providers/hooks'
import { getPostImages } from '../../shared/lib/postImages'
import styles from '../CreatePostPage/CreatePostPage.module.css'

// Задаёт ограничение, используемое при проверке или отображении данных.
const maxDescriptionLength = 200
// Задаёт ограничение, используемое при проверке или отображении данных.
const maxImagesCount = 10
// Задаёт ограничение, используемое при проверке или отображении данных.
const maxImageSizeBytes = 10 * 1024 * 1024
// Задаёт ограничение, используемое при проверке или отображении данных.
const maxImageSizeMb = maxImageSizeBytes / 1024 / 1024

type SelectedImage = {
  id: string
  preview: string
  file?: File
  existingUrl?: string
}

// Выполняет логику EditPostPage в текущем модуле.
function EditPostPage() {
  const { postId } = useParams<{ postId: string }>()
  // Хранит значение «dispatch», необходимое для текущего логического блока.
  const dispatch = useAppDispatch()
  // Хранит значение «navigate», необходимое для текущего логического блока.
  const navigate = useNavigate()
  const { myProfile } = useAppSelector((state) => state.profile)
  const { selectedPost, selectedStatus, updateStatus, error } = useAppSelector(
    (state) => state.posts,
  )
  const [description, setDescription] = useState('')
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [formPostId, setFormPostId] = useState<string | null>(null)
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  // Хранит значение «fileInputRef», необходимое для текущего логического блока.
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  // Хранит значение «selectedImagesRef», необходимое для текущего логического блока.
  const selectedImagesRef = useRef<SelectedImage[]>([])

  // Хранит значение «avatar», необходимое для текущего логического блока.
  const avatar =
    myProfile?.avatar || selectedPost?.author.avatar || '/icons/ICH_avatar.png'
  // Хранит значение «username», необходимое для текущего логического блока.
  const username =
    myProfile?.username || selectedPost?.author.username || 'user'
  // Хранит результат проверки условия для последующей логики интерфейса.
  const isLoading = updateStatus === 'loading'
  // Хранит значение «canSubmit», необходимое для текущего логического блока.
  const canSubmit =
    Boolean(selectedPost) && selectedImages.length > 0 && !isLoading
  // Хранит значение «canAddMoreImages», необходимое для текущего логического блока.
  const canAddMoreImages = selectedImages.length < maxImagesCount
  // Хранит значение «activeImage», необходимое для текущего логического блока.
  const activeImage = selectedImages[activeImageIndex] ?? selectedImages[0]

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!myProfile) {
      dispatch(fetchMyProfile())
    }
  }, [dispatch, myProfile])

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (postId) {
      dispatch(fetchPostById(postId))
    }
  }, [dispatch, postId])

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (selectedPost && formPostId !== selectedPost._id) {
    setFormPostId(selectedPost._id)
    setDescription(selectedPost.description || '')
    setSelectedImages(
      getPostImages(selectedPost).map((imageUrl, index) => ({
        id: `${imageUrl}-${index}`,
        preview: imageUrl,
        existingUrl: imageUrl,
      })),
    )
    setActiveImageIndex(0)
  }

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    selectedImagesRef.current = selectedImages
  }, [selectedImages])

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => {
        // Проверяет условие и выбирает дальнейший сценарий выполнения.
        if (image.file) {
          URL.revokeObjectURL(image.preview)
        }
      })
    }
  }, [])

  // Хранит значение «counterText», необходимое для текущего логического блока.
  const counterText = useMemo(
    () => `${description.length}/${maxDescriptionLength}`,
    [description.length],
  )

  // Обрабатывает действие пользователя: EmojiClick.
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setDescription((current) =>
      `${current}${emojiData.emoji}`.slice(0, maxDescriptionLength),
    )
  }

  // Обрабатывает действие пользователя: ImageChange.
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Хранит значение «files», необходимое для текущего логического блока.
    const files = Array.from(event.target.files ?? [])

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (files.length === 0) {
      return
    }

    // Хранит значение «validFiles», необходимое для текущего логического блока.
    const validFiles = files.filter((file) => file.size <= maxImageSizeBytes)
    // Хранит значение «oversizedFiles», необходимое для текущего логического блока.
    const oversizedFiles = files.filter((file) => file.size > maxImageSizeBytes)

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (oversizedFiles.length > 0) {
      setUploadError(
        `Each image must be smaller than ${maxImageSizeMb} MB. ${oversizedFiles.length} file(s) were not added.`,
      )
    } else {
      setUploadError(null)
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (validFiles.length === 0) {
      event.target.value = ''
      return
    }

    setSelectedImages((currentImages) => {
      // Хранит значение «remainingSlots», необходимое для текущего логического блока.
      const remainingSlots = maxImagesCount - currentImages.length
      // Хранит значение «imagesToAdd», необходимое для текущего логического блока.
      const imagesToAdd = validFiles
        .slice(0, remainingSlots)
        .map((file, index) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
          file,
          preview: URL.createObjectURL(file),
        }))

      setActiveImageIndex(currentImages.length)

      return [...currentImages, ...imagesToAdd]
    })

    event.target.value = ''
  }

  // Обрабатывает действие пользователя: RemoveImage.
  const handleRemoveImage = (imageId: string) => {
    setSelectedImages((currentImages) => {
      // Хранит значение «imageToRemove», необходимое для текущего логического блока.
      const imageToRemove = currentImages.find((image) => image.id === imageId)

      // Проверяет условие и выбирает дальнейший сценарий выполнения.
      if (imageToRemove?.file) {
        URL.revokeObjectURL(imageToRemove.preview)
      }

      // Хранит значение «nextImages», необходимое для текущего логического блока.
      const nextImages = currentImages.filter((image) => image.id !== imageId)
      setActiveImageIndex((currentIndex) =>
        Math.min(currentIndex, Math.max(nextImages.length - 1, 0)),
      )

      return nextImages
    })
  }

  // Отображает нужный элемент: PreviousImage.
  const showPreviousImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? selectedImages.length - 1 : currentIndex - 1,
    )
  }

  // Отображает нужный элемент: NextImage.
  const showNextImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === selectedImages.length - 1 ? 0 : currentIndex + 1,
    )
  }

  // Обрабатывает действие пользователя: Submit.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!postId || !selectedPost) {
      return
    }

    // Хранит значение «formData», необходимое для текущего логического блока.
    const formData = new FormData()
    formData.append('description', description.trim())
    formData.append(
      'existingImages',
      JSON.stringify(
        selectedImages
          .map((image) => image.existingUrl)
          .filter((imageUrl): imageUrl is string => Boolean(imageUrl)),
      ),
    )
    selectedImages.forEach((image) => {
      // Проверяет условие и выбирает дальнейший сценарий выполнения.
      if (image.file) {
        formData.append('images', image.file)
      }
    })

    // Хранит значение «result», необходимое для текущего логического блока.
    const result = await dispatch(updatePost({ postId, formData }))

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (updatePost.fulfilled.match(result)) {
      navigate('/profile')
    }
  }

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (selectedStatus === 'failed') {
    return (
      <section className={styles.page} aria-label="Post error">
        <form className={styles.modal}>
          <p className={styles.error}>{error || 'Failed to load post'}</p>
        </form>
      </section>
    )
  }

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (
    selectedStatus === 'idle' ||
    selectedStatus === 'loading' ||
    !selectedPost
  ) {
    return (
      <section className={styles.page} aria-label="Loading post">
        <form className={styles.modal}>
          <Spinner label="Loading post..." />
        </form>
      </section>
    )
  }

  return (
    <section className={styles.page} aria-label="Edit post">
      <form className={styles.modal} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h1>Edit post</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.shareButton}
              type="submit"
              disabled={!canSubmit}>
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              className={styles.closeButton}
              type="button"
              onClick={() => navigate('/profile')}>
              Close
            </button>
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.uploadArea}>
            <input
              ref={fileInputRef}
              className={styles.fileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {selectedImages.length > 0 ? (
              <div className={styles.previewPanel}>
                <div className={styles.previewToolbar}>
                  <span>
                    Selected photos {selectedImages.length}/{maxImagesCount}
                  </span>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    disabled={!canAddMoreImages}
                    onClick={() => fileInputRef.current?.click()}>
                    Add more
                  </button>
                </div>
                {activeImage && (
                  <div className={styles.carouselPreview}>
                    <img
                      className={styles.previewImage}
                      src={activeImage.preview}
                      alt=""
                      aria-label={`Selected image ${activeImageIndex + 1}`}
                    />
                    {selectedImages.length > 1 && (
                      <>
                        <button
                          className={`${styles.imageNavButton} ${styles.imageNavButtonLeft}`}
                          type="button"
                          aria-label="Previous selected image"
                          onClick={showPreviousImage}>
                          &lt;
                        </button>
                        <button
                          className={`${styles.imageNavButton} ${styles.imageNavButtonRight}`}
                          type="button"
                          aria-label="Next selected image"
                          onClick={showNextImage}>
                          &gt;
                        </button>
                        <span className={styles.imageCounter}>
                          {activeImageIndex + 1}/{selectedImages.length}
                        </span>
                      </>
                    )}
                    <button
                      className={styles.removeImageButton}
                      type="button"
                      aria-label={`Remove image ${activeImageIndex + 1}`}
                      onClick={() => handleRemoveImage(activeImage.id)}>
                      &times;
                    </button>
                  </div>
                )}
                {selectedImages.length > 1 && (
                  <div className={styles.thumbnailStrip}>
                    {selectedImages.map((image, index) => (
                      <button
                        className={`${styles.thumbnailButton} ${
                          index === activeImageIndex
                            ? styles.thumbnailButtonActive
                            : ''
                        }`}
                        type="button"
                        key={image.id}
                        aria-label={`Show selected image ${index + 1}`}
                        onClick={() => setActiveImageIndex(index)}>
                        <img src={image.preview} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.uploadPrompt}>
                <img
                  className={styles.uploadIcon}
                  src="/icons/icon-upload.png"
                  alt=""
                  aria-hidden="true"
                />
                <p>Select up to 10 photos</p>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}>
                  Select photos
                </button>
              </div>
            )}
          </div>

          <aside className={styles.details}>
            <div className={styles.author}>
              <img src={avatar} alt="" />
              <span>{username}</span>
            </div>

            <textarea
              className={styles.textarea}
              maxLength={maxDescriptionLength}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              aria-label="Post description"
            />

            <p className={styles.counter}>{counterText}</p>

            <div className={styles.footerRow}>
              <button
                className={styles.smileButton}
                type="button"
                aria-label="Choose emoji"
                onClick={() => setIsEmojiOpen((current) => !current)}>
                <img src="/icons/smile_btn.png" alt="" aria-hidden="true" />
              </button>
              {isEmojiOpen && (
                <div className={styles.emojiPicker}>
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
          </aside>
        </div>

        {(uploadError || error) && (
          <p className={styles.error}>{uploadError || error}</p>
        )}
      </form>
    </section>
  )
}

export default EditPostPage
