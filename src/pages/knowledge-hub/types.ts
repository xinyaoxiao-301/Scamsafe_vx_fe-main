export type KnowledgeHubIcon = 'gift' | 'bank' | 'chart' | 'mail' | 'spark'

export type KnowledgeHubExample = {
  id: string
  title: string
  kind: 'sms' | 'email'
  channelLabel: string
  timeLabel: string
  fromLabel: string
  subject?: string
  previewLines: string[]
  actionText?: string
  hint: string
}

export type KnowledgeHubArticle = {
  id: string
  title: string
  publishedOn: string
  source: string
  sourceHref: string
  summary: string
  detail: string
  warningSigns: string[]
  tips: string[]
}

export type KnowledgeHubCategory = {
  id: string
  label: string
  helper: string
  icon: KnowledgeHubIcon
  articles: KnowledgeHubArticle[]
  examples: KnowledgeHubExample[]
}
