import { FeaturePage } from '@/pages/shared/FeaturePage'
import { useI18n } from '@/lib/i18n'

type PostScamSupportPageProps = {
  onBackHome: () => void
}

export function PostScamSupportPage({ onBackHome }: PostScamSupportPageProps) {
  const { strings } = useI18n()

  return (
    <FeaturePage
      eyebrow={strings.postScamSupport.eyebrow}
      title={strings.postScamSupport.title}
      description={strings.postScamSupport.description}
      highlights={strings.postScamSupport.highlights}
      supportNote={strings.postScamSupport.supportNote}
      onBackHome={onBackHome}
    />
  )
}
