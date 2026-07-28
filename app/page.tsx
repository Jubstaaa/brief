import { readBriefs, toEntry } from '@/lib/storage/archive'
import ArchiveView from '@/views/archive/archive'

export default async function HomePage() {
    const briefs = await readBriefs()

    return <ArchiveView entries={briefs.map(toEntry)} />
}
