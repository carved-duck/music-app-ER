import { useSignal } from '@preact/signals'
import { FileListScreen } from './FileListScreen'
import { PlaybackScreen } from './PlaybackScreen'
import { selectFile } from '../state/store'

type Screen = 'list' | 'playback'

export function App() {
  const screen = useSignal<Screen>('list')

  function handleSelect(fileId: string) {
    selectFile(fileId)
    screen.value = 'playback'
  }

  if (screen.value === 'playback') {
    return <PlaybackScreen onBack={() => (screen.value = 'list')} />
  }

  return <FileListScreen onSelect={handleSelect} />
}
