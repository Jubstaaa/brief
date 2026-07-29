import type { BriefKind } from '@/lib/schemas/triage.schema'

export const KIND_LABELS: Record<BriefKind, string> = {
    breaking: 'Kırılma',
    feature: 'Yeni',
    fix: 'Düzeltme',
    performance: 'Performans',
    security: 'Güvenlik',
}
