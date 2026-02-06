export function formatRelativeDate(iso: string): string {
    const date = new Date(iso)
    const now = new Date()


    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)


    if (diffSec < 10) return 'agora'
    if (diffSec < 60) return `${diffSec}s atrás`


    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}min atrás`


    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h atrás`


    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 30) return `${diffDays}d atrás`


    return date.toLocaleDateString('pt-BR')
}