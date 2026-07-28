import { readArchive } from '@/lib/storage/archive'
import ArchiveView from '@/views/archive/archive'

export default async function HomePage() {
    return <ArchiveView entries={await readArchive()} />
}
