import { useState } from 'react'
import './App.css'

// Components
import InputForm from './InputForm'
import SlideSidebar from './SlideSidebar'
import SlideEditor from './SlideEditor'
import AIControlPanel from './AIControlPanel'
import ExportPanel from './ExportPanel'

const API_URL = 'http://localhost:8000'

const heroFeatures = [
  {
    title: 'Generate',
    description: 'Start with an idea, paste in an outline, or import existing content.',
    icon: '⚡'
  },
  {
    title: 'Shape',
    description: 'Edit with AI, add smart layouts, and polish your message instantly.',
    icon: '🧠'
  },
  {
    title: 'Share',
    description: 'Export to PPT, PDF, or Google Slides and share with confidence.',
    icon: '🚀'
  }
]

const productCards = [
  { title: 'Presentations', subtitle: 'Turn any idea into a polished slide deck. Export to PPT, PDF, and more.' },
  { title: 'Social Media', subtitle: 'Generate ready-to-post visuals and captions for your brand.' },
  { title: 'Documents', subtitle: 'Create structured, visual documents from one prompt.' },
  { title: 'Websites', subtitle: 'Build shareable website landing pages with AI-generated content.' },
  { title: 'API', subtitle: 'Automate creation, integrate with workflows, and scale content.' },
  { title: 'Graphics', subtitle: 'Design branded visuals, illustrations, and data-rich graphics.' }
]

const testimonials = [
  {
    quote: 'Beyond saving me hours of labor, I now channel my time into more meaningful work.',
    name: 'Christina Salazar',
    role: 'English Language Development Teacher'
  },
  {
    quote: 'Gamma has made me something of a campus hero — it feels effortless to create.',
    name: 'Jordan Crawford',
    role: 'Founder'
  },
  {
    quote: 'This product rocks! I no longer use Google Slides — it feels prehistoric now.',
    name: 'Denise Penn',
    role: 'Social Media Content Creator'
  }
]

function App() {
  const [currentStep, setCurrentStep] = useState('input')
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

  const scrollToForm = () => {
    const formSection = document.getElementById('form-section')
    formSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <div className="site-header">
        <div className="brand-logo">
          <div className="brand-mark">AI</div>
          <div>
            <div className="brand-name">Gamma Deck</div>
            <div className="brand-subtitle">AI Presentation Builder</div>
          </div>
        </div>
        <div className="nav-actions">
          {currentStep === 'editor' ? (
            <button className="btn-secondary" onClick={handleNewPresentation}>
              New Presentation
            </button>
          ) : (
            <button className="btn-secondary" onClick={scrollToForm}>
              Create Presentation
            </button>
          )}
          {currentStep === 'editor' && (
            <button className="btn-primary" onClick={() => setCurrentStep('export')}>
              Export
            </button>
          )}
        </div>
      </div>

      {currentStep === 'input' && (
        <main className="hero-layout">
          <section className="hero-copy">
            <span className="eyebrow">AI presentation builder</span>
            <h1>Effortless AI design for presentations, websites, and more</h1>
            <p>
              Your ideas are brilliant. The universe deserves to see them.
              A captivating pitch deck? Easy. A stunning website? Done.
              Make anything you can imagine almost as quickly as you can think it up.
            </p>

            <div className="hero-cta">
              <button className="btn-primary" onClick={scrollToForm}>
                Start for free
              </button>
              <button className="btn-secondary" onClick={() => setError('Video preview is not available in this app yet')}>
                Watch demo
              </button>
            </div>

            <div className="hero-pill-grid">
              {heroFeatures.map((feature) => (
                <div key={feature.title} className="hero-pill">
                  <span>{feature.icon}</span>
                  <div>
                    <strong>{feature.title}</strong>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="hero-panel" id="form-section">
            <div className="hero-panel-card">
              <div className="hero-panel-label">AI Presentation Builder</div>
              <InputForm
                onGenerate={handleGeneratePresentation}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </section>
        </main>
      )}

      {currentStep === 'input' && (
        <section className="feature-grid">
          {productCards.map((product) => (
            <div key={product.title} className="product-card">
              <div className="product-title">{product.title}</div>
              <p>{product.subtitle}</p>
            </div>
          ))}
        </section>
      )}

      {currentStep === 'input' && (
        <section className="testimonial-section">
          <div className="testimonial-header">
            <h2>Join 50+ million users changing how the world communicates</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="testimonial-card">
                <p className="testimonial-quote">“{testimonial.quote}”</p>
                <p className="testimonial-author">
                  <span>{testimonial.name}</span>
                  <span>{testimonial.role}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {currentStep === 'editor' && (
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
      )}

      {currentStep === 'export' && (
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
      )}
    </div>
  )
}

export default App
