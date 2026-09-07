import { useState } from 'react'
import Landing from './components/Landing'
import EcoVadisCapture from './components/EcoVadisCapture'
import QuestionnaireCapture from './components/QuestionnaireCapture'
import DoorSelection from './components/DoorSelection'
import Door1Wizard from './components/Door1Wizard'
import Door2Upload from './components/Door2Upload'
import ReviewSubmit from './components/ReviewSubmit'
import Confirmation from './components/Confirmation'
import { EMPTY_CONTACT } from './data/contactSchema'
import { SECTIONS } from './data/questionnaireSchema'

// Views:
//   'landing' | 'ecovadis' | 'questionnaire-capture' | 'doors'
//   | 'door1' | 'door2-upload' | 'review' | 'confirmation'
//
// Identity and answers live here for the life of the tab. The Questionnaire
// route writes nothing until final submit on the Review screen; the EcoVadis
// route writes from its own capture screen. Every write goes through the
// server-side Netlify Function — see CLAUDE.md Hard Rules.

export default function App() {
  const [view, setView] = useState('landing')
  const [contact, setContact] = useState(EMPTY_CONTACT)
  const [answers, setAnswers] = useState({})
  const [door, setDoor] = useState(null)
  const [wizardSection, setWizardSection] = useState(0)
  const [submission, setSubmission] = useState(null)

  function goHome() {
    setView('landing')
    setContact(EMPTY_CONTACT)
    setAnswers({})
    setDoor(null)
    setWizardSection(0)
    setSubmission(null)
  }

  function handleCaptureContinue(values) {
    setContact(values)
    setView('doors')
  }

  function handleDoor1Submit(submittedAnswers) {
    setAnswers(submittedAnswers)
    setDoor('door1')
    setView('review')
  }

  function handleDoor2Parsed(parsedAnswers) {
    setAnswers(parsedAnswers)
    setDoor('door2')
    setView('review')
  }

  function handleReviewBack() {
    if (door === 'door2') {
      // Discard the parsed answers along with the file — no upload is retained after parsing.
      setAnswers({})
      setView('door2-upload')
      return
    }
    setWizardSection(SECTIONS.length - 1)
    setView('door1')
  }

  function handleSubmitted(row) {
    setSubmission(row)
    setView('confirmation')
  }

  switch (view) {
    case 'landing':
      return (
        <Landing
          onStartEcoVadis={() => setView('ecovadis')}
          onStartQuestionnaire={() => setView('questionnaire-capture')}
        />
      )
    case 'ecovadis':
      return <EcoVadisCapture onBack={goHome} />
    case 'questionnaire-capture':
      return (
        <QuestionnaireCapture
          initialValues={contact}
          onContinue={handleCaptureContinue}
          onBack={goHome}
        />
      )
    case 'doors':
      return (
        <DoorSelection
          onSelectDoor1={() => {
            setWizardSection(0)
            setView('door1')
          }}
          onSelectDoor2={() => setView('door2-upload')}
          onBack={() => setView('questionnaire-capture')}
        />
      )
    case 'door1':
      return (
        <Door1Wizard
          initialAnswers={answers}
          initialSectionIndex={wizardSection}
          onSubmit={handleDoor1Submit}
          onBack={() => setView('doors')}
        />
      )
    case 'door2-upload':
      return <Door2Upload onParsed={handleDoor2Parsed} onBack={() => setView('doors')} />
    case 'review':
      return (
        <ReviewSubmit
          door={door}
          contact={contact}
          answers={answers}
          onBack={handleReviewBack}
          onSubmitted={handleSubmitted}
        />
      )
    case 'confirmation':
      return (
        <Confirmation
          contact={contact}
          answers={answers}
          submission={submission}
          onReturnHome={goHome}
        />
      )
    default:
      return (
        <Landing
          onStartEcoVadis={() => setView('ecovadis')}
          onStartQuestionnaire={() => setView('questionnaire-capture')}
        />
      )
  }
}
