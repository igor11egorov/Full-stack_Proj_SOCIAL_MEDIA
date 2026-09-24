// Отображает страницу редактирования профиля: загружает текущие данные пользователя,
// позволяет изменить их и отправляет обновления, включая новую фотографию, на сервер.
// Основные части: данные, локальное состояние и отображение страницы.
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../../shared/ui/spinner/Spinner'
import {
  fetchMyProfile,
  updateMyProfile,
} from '../../entities/user/model/profileThunks'
import { useAppDispatch, useAppSelector } from '../../app/providers/hooks'
import type { User } from '../../entities/user/types/user'
import styles from './EditProfilePage.module.css'

// Задаёт ограничение, используемое при проверке или отображении данных.
const maxBioLength = 150

type EditProfileFormProps = {
  myProfile: User
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

// Выполняет логику EditProfileForm в текущем модуле.
function EditProfileForm({ myProfile, status, error }: EditProfileFormProps) {
  // Хранит значение «dispatch», необходимое для текущего логического блока.
  const dispatch = useAppDispatch()
  // Хранит значение «navigate», необходимое для текущего логического блока.
  const navigate = useNavigate()
  // Хранит значение «fileInputRef», необходимое для текущего логического блока.
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [username, setUsername] = useState(myProfile.username || '')
  const [website, setWebsite] = useState(myProfile.website || '')
  const [bio, setBio] = useState(myProfile.bio || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(
    myProfile.avatar || '/icons/ICH_avatar.png',
  )

  // Хранит результат проверки условия для последующей логики интерфейса.
  const isLoading = status === 'loading'

  // Обрабатывает действие пользователя: PhotoChange.
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Хранит значение «file», необходимое для текущего логического блока.
    const file = event.target.files?.[0]

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!file) {
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  // Обрабатывает действие пользователя: Submit.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Хранит значение «formData», необходимое для текущего логического блока.
    const formData = new FormData()
    formData.append('username', username.trim())
    formData.append('website', website.trim())
    formData.append('bio', bio.trim())

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (avatarFile) {
      formData.append('avatar', avatarFile)
    }

    // Хранит значение «result», необходимое для текущего логического блока.
    const result = await dispatch(updateMyProfile(formData))

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (updateMyProfile.fulfilled.match(result)) {
      navigate('/profile')
    }
  }

  return (
    <section className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Edit profile</h1>

        <div className={styles.summary}>
          <img className={styles.avatar} src={avatarPreview} alt="" />
          <div className={styles.summaryText}>
            <p>{username || 'ichschool'}</p>
            <span>{bio.split('\n')[0]}</span>
          </div>
          <button
            className={styles.photoButton}
            type="button"
            onClick={() => fileInputRef.current?.click()}>
            New photo
          </button>
          <input
            ref={fileInputRef}
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>

        <label className={styles.field}>
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Website</span>
          <div className={styles.websiteField}>
            <img
              className={styles.websiteIcon}
              src="/icons/icon-website.png"
              alt=""
              aria-hidden="true"
            />
            <input
              type="text"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>
        </label>

        <label className={styles.field}>
          <span>About</span>
          <div className={styles.textareaWrap}>
            <textarea
              value={bio}
              maxLength={maxBioLength}
              onChange={(event) => setBio(event.target.value)}
            />
            <span className={styles.counter}>
              {bio.length} / {maxBioLength}
            </span>
          </div>
        </label>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.actions}>
          <button
            className={styles.saveButton}
            type="submit"
            disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            className={styles.exitButton}
            type="button"
            onClick={() => navigate('/profile')}>
            Exit
          </button>
        </div>
      </form>
    </section>
  )
}

// Выполняет логику EditProfilePage в текущем модуле.
function EditProfilePage() {
  // Хранит значение «dispatch», необходимое для текущего логического блока.
  const dispatch = useAppDispatch()
  const { myProfile, status, error } = useAppSelector((state) => state.profile)

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!myProfile) {
      dispatch(fetchMyProfile())
    }
  }, [dispatch, myProfile])

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (!myProfile) {
    return <Spinner label="Loading profile..." />
  }

  return (
    <EditProfileForm
      key={myProfile._id || myProfile.userId || myProfile.id}
      myProfile={myProfile}
      status={status}
      error={error}
    />
  )
}

export default EditProfilePage
