import { useState, useEffect } from 'react'
import './App.css'

// Components
import InputForm from './InputForm'
import SlideSidebar from './SlideSidebar'
import SlideEditor from './SlideEditor'
import AIControlPanel from './AIControlPanel'
import ExportPanel from './ExportPanel'

const API_URL = 'http://localhost:8000'

function App() {
  const [currentStep, setCurrentStep] = useState('input') // 'input', 'editor', 'export'
  const [presentationData, setPresentationData] = useState(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGeneratePresentation = async (inputData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/generate-presentation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate presentation')
      }

      const data = await response.json()
      setPresentationData(data)
      setCurrentStep('editor')
      setCurrentSlideIndex(0)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateSection = async (regenerateType) => {
    if (!presentationData) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/regenerate-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slide_index: currentSlideIndex,
          regenerate_type: regenerateType,
          current_title: presentationData.slides[currentSlideIndex]?.title,
          current_bullets: presentationData.slides[currentSlideIndex]?.bullets,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate section')
      }

      const newSlideData = await response.json()

      // Update only the current slide
      const updatedSlides = [...presentationData.slides]
      updatedSlides[currentSlideIndex] = newSlideData
      setPresentationData({ ...presentationData, slides: updatedSlides })
    } catch (err) {
      console.error(err)
      setError('Failed to regenerate section')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSlide = (updatedSlide) => {
    if (!presentationData) return

    const updatedSlides = [...presentationData.slides]
    updatedSlides[currentSlideIndex] = updatedSlide
    setPresentationData({ ...presentationData, slides: updatedSlides })
  }

  const handleExport = async () => {
    if (!presentationData) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/export-ppt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presentationData),
      })

      if (!response.ok) {
        throw new Error('Failed to export presentation')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = `${presentationData.slides[0]?.title || 'presentation'}.pptx`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error(err)
      setError('Failed to export presentation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewPresentation = () => {
    setCurrentStep('input')
    setPresentationData(null)
    setCurrentSlideIndex(0)
    setError('')
  }

  if (currentStep === 'input') {
    return (
      <div className="app">
        <InputForm
          onGenerate={handleGeneratePresentation}
          isLoading={isLoading}
          error={error}
        />
      </div>
    )
  }

  if (currentStep === 'export') {
    return (
      <div className="app">
        <ExportPanel
          presentationData={presentationData}
          onExport={handleExport}
          onBack={() => setCurrentStep('editor')}
          onNew={handleNewPresentation}
          isLoading={isLoading}
          error={error}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>Structured AI Presentation Builder</h1>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={handleNewPresentation}
          >
            New Presentation
          </button>
          <button
            className="btn-primary"
            onClick={() => setCurrentStep('export')}
          >
            Export
          </button>
        </div>
      </div>

      <div className="app-content">
        <SlideSidebar
          slides={presentationData?.slides || []}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={setCurrentSlideIndex}
        />

        <SlideEditor
          slide={presentationData?.slides[currentSlideIndex]}
          onUpdate={handleUpdateSlide}
          isLoading={isLoading}
        />

        <AIControlPanel
          onRegenerateTitle={() => handleRegenerateSection('title')}
          onRegenerateBullets={() => handleRegenerateSection('bullets')}
          onRegenerateSlide={() => handleRegenerateSection('slide')}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
    </div>
  )
}

export default App
