import { files } from '../state/store'
import type { TabFile } from '../state/types'

interface Props {
  onSelect: (id: string) => void
}

export function FileListScreen({ onSelect }: Props) {
  const list = files.value

  return (
    <div class="screen">
      <div class="card">
        <h1 class="card-title">Teleprompt</h1>
        <p class="card-subtitle">Guitar tabs on your glasses</p>
      </div>

      <div class="section-label">Files &middot; {list.length}</div>

      {list.length === 0 && (
        <div class="card">
          <div class="empty-state">
            <div class="empty-state-icon">♪</div>
            <p class="empty-state-text">
              No tab files loaded yet.
            </p>
          </div>
        </div>
      )}

      {list.map((file: TabFile) => (
        <button
          key={file.id}
          class="file-item"
          onClick={() => onSelect(file.id)}
        >
          <div class="file-item-info">
            <div class="file-item-title">{file.title}</div>
            <div class="file-item-meta">
              {file.artist} &middot; {file.bpm ? `${file.bpm} BPM` : file.tuning}
            </div>
          </div>
          <div class="file-item-chevron" aria-hidden="true">›</div>
        </button>
      ))}
    </div>
  )
}
