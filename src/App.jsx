import { useState } from 'react'
import Landing from './components/Landing'
import DoorSelection from './components/DoorSelection'
import Door1Wizard from './components/Door1Wizard'
import Door2Upload from './components/Door2Upload'
import Door2Review from './components/Door2Review'
import Confirmation from './components/Confirmation'

// Views: 'landing' | 'doors' | 'door1' | 'door2-upload' | 'door2-review' | 'confirmation'
// All state lives here, in memory, for the life of the tab. Nothing is persisted
// and no network call ever carries an answer — see CLAUDE.md Hard Rules.

export default function App() {
  const [view, setView] = useState('landing')
  const [answers, setAnswers] = useState({})

  function goHome() {
    setView('landing')
    setAnswers({})
  }

  function handleDoor1Submit(submittedAnswers) {
    setAnswers(submittedAnswers)
    setView('confirmation')
  }

  function handleDoor2Parsed(parsedAnswers) {
    setAnswers(parsedAnswers)
    setView('door2-review')
  }

  function handleDoor2Submit() {
    setView('confirmation')
  }

  function handleDoor2Reupload() {
    // Discard the parsed answers along with the file — no upload is retained after parsing.
    setAnswers({})
    setView('door2-upload')
  }

  switch (view) {
    case 'landing':
      return <Landing onStartQuestionnaire={() => setView('doors')} />
    case 'doors':
      return (
        <DoorSelection
          onSelectDoor1={() => setView('door1')}
          onSelectDoor2={() => setView('door2-upload')}
          onBack={goHome}
        />
      )
    case 'door1':
      return <Door1Wizard onSubmit={handleDoor1Submit} onBack={() => setView('doors')} />
    case 'door2-upload':
      return <Door2Upload onParsed={handleDoor2Parsed} onBack={() => setView('doors')} />
    case 'door2-review':
      return <Door2Review answers={answers} onSubmit={handleDoor2Submit} onReupload={handleDoor2Reupload} />
    case 'confirmation':
      return <Confirmation answers={answers} onReturnHome={goHome} />
    default:
      return <Landing onStartQuestionnaire={() => setView('doors')} />
  }
}
