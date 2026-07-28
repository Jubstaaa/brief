import { SITE_REPO_URL } from '@/lib/constants/site.constants'

export default function RepoLink() {
    return (
        <a
            aria-label="Kaynak kodu GitHub'da"
            className="text-muted hover:text-ink absolute top-4 right-5 transition-colors"
            href={SITE_REPO_URL}
            rel="noreferrer noopener"
            target="_blank">
            <svg
                aria-hidden="true"
                fill="currentColor"
                height="20"
                viewBox="0 0 16 16"
                width="20">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-2.91-.88-2.91-2.79 0-.55.2-1.16.63-1.65-.06-.15-.27-.79.06-1.65 0 0 .61-.19 2 .74a5.2 5.2 0 0 1 1.35-.18c.46 0 .92.06 1.35.18 1.39-.94 2-.74 2-.74.33.86.12 1.5.06 1.65.43.49.63 1.1.63 1.65 0 1.92-1.14 2.59-2.92 2.79.3.26.56.76.56 1.54 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.99 7.99 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
        </a>
    )
}
