import {
  currentFile,
  currentWindow,
  bpm,
  isPlaying,
  windowIndex,
  totalWindows,
  progress,
  setBpm,
  togglePlayback,
  nextWindow,
  prevWindow,
} from '../state/store'

interface Props {
  onBack: () => void
}

export function PlaybackScreen({ onBack }: Props) {
  const file = currentFile.value
  if (!file) {
    return (
      <div class="screen">
        <div class="card">
          <p class="card-subtitle">No file selected</p>
          <button class="btn btn-secondary" onClick={onBack}>Back</button>
        </div>
      </div>
    )
  }

  return (
    <div class="screen">
      {/* Nav */}
      <div class="nav-bar">
        <button class="nav-back" onClick={onBack}>← Back</button>
        <span class="nav-title">Now Playing</span>
        <span style={{ width: 48 }} />
      </div>

      {/* Song info */}
      <div class="card">
        <h1 class="card-title">{file.title}</h1>
        <p class="card-subtitle">{file.artist}</p>
        <p class="card-subtitle">{file.tuning}</p>
      </div>

      {/* BPM control */}
      <div class="card">
        <div class="section-label">Tempo</div>
        <div class="bpm-control">
          <button class="bpm-btn" aria-label="Decrease BPM" onClick={() => setBpm(bpm.value - 5)}>-</button>
          <div class="bpm-value" aria-live="polite">{bpm.value}</div>
          <button class="bpm-btn" aria-label="Increase BPM" onClick={() => setBpm(bpm.value + 5)}>+</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span class="card-subtitle">BPM</span>
        </div>
      </div>

      {/* Play/Pause */}
      <div class="card">
        <button
          class={`btn btn-full ${isPlaying.value ? 'btn-danger' : 'btn-success'}`}
          onClick={togglePlayback}
        >
          {isPlaying.value ? 'Pause' : 'Play'}
        </button>
      </div>

      {/* Glasses Preview */}
      <div class="glasses-preview-wrapper">
        <div class="section-label">Glasses Preview</div>
        <div class="glasses-preview">
          <pre class="glasses-preview-content">{currentWindow.value || 'No content'}</pre>
        </div>
        <div class="glasses-preview-nav">
          <button
            class="bpm-btn"
            aria-label="Previous window"
            onClick={prevWindow}
            disabled={windowIndex.value <= 0}
          >
            ↑
          </button>
          <button
            class="bpm-btn"
            aria-label="Next window"
            onClick={nextWindow}
            disabled={windowIndex.value >= totalWindows.value - 1}
          >
            ↓
          </button>
        </div>
      </div>

      {/* Progress */}
      <div class="card">
        <div class="section-label">Progress</div>
        <p class="card-subtitle">
          Window {windowIndex.value + 1} of {totalWindows.value}
        </p>
        <div
          class="progress-bar"
          role="progressbar"
          aria-valuenow={progress.value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Playback progress"
        >
          <div class="progress-fill" style={{ width: `${progress.value}%` }} />
        </div>
      </div>
    </div>
  )
}
