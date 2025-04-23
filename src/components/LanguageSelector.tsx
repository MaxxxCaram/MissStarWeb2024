import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

export default function LanguageSelector() {
  const router = useRouter()
  const { t } = useTranslation()

  const changeLanguage = (locale: string) => {
    const { pathname, asPath, query } = router
    router.push({ pathname, query }, asPath, { locale })
  }

  return (
    <select
      value={router.locale}
      onChange={(e) => changeLanguage(e.target.value)}
      className="bg-transparent border-none text-white focus:outline-none"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  )
} 