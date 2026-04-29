import React, { useState } from 'react';
import { Sparkles, Download, Plus, Trash2, Image, Type, Layout, Wand2, ChevronLeft, ChevronRight, Grid, List, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette, Copy, Settings } from 'lucide-react';

export default function PPTMaker() {
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: 'Welcome to PPT Maker',
      subtitle: 'Create stunning presentations with AI',
      content: 'Click "Generate with AI" to get started or edit this slide manually',
      layout: 'title',
      theme: 'gradient-blue',
      fontSize: 'large',
      alignment: 'left'
    }
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const themes = [
    { id: 'gradient-blue', name: 'Ocean Blue', colors: 'from-blue-500 to-purple-600', textColor: 'text-white' },
    { id: 'gradient-sunset', name: 'Sunset', colors: 'from-orange-500 to-pink-600', textColor: 'text-white' },
    { id: 'gradient-forest', name: 'Forest', colors: 'from-green-500 to-teal-600', textColor: 'text-white' },
    { id: 'gradient-dark', name: 'Dark Mode', colors: 'from-gray-800 to-gray-900', textColor: 'text-white' },
    { id: 'gradient-minimal', name: 'Minimal White', colors: 'from-gray-50 to-gray-100', textColor: 'text-gray-800' },
    { id: 'gradient-vibrant', name: 'Vibrant', colors: 'from-pink-500 to-yellow-500', textColor: 'text-white' },
    { id: 'gradient-ocean', name: 'Ocean Depth', colors: 'from-cyan-600 to-blue-800', textColor: 'text-white' },
    { id: 'gradient-royal', name: 'Royal Purple', colors: 'from-purple-700 to-indigo-900', textColor: 'text-white' }
  ];

  const layouts = [
    { id: 'title', name: 'Title Slide', icon: Type, preview: '▪️ Title\n▪️ Subtitle' },
    { id: 'content', name: 'Content', icon: Layout, preview: '▪️ Title\n▪️ Bullet Points' },
    { id: 'two-column', name: 'Two Column', icon: Grid, preview: '▪️ Left | Right' },
    { id: 'image', name: 'Image Focus', icon: Image, preview: '▪️ Title\n🖼️ Image' }
  ];

  const generatePresentation = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setShowAIPanel(false);
    
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      
      if (data.slides) {
        setSlides(data.slides.map((slide, index) => ({
          id: index + 1,
          ...slide,
          theme: 'gradient-blue',
          fontSize: 'large',
          alignment: 'left'
        })));
        setCurrentSlide(0);
      }
    } catch (error) {
      console.error('Error generating presentation:', error);
      generateDemoSlides();
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const generateDemoSlides = () => {
    const demoSlides = [
      {
        id: 1,
        title: prompt || 'AI Generated Presentation',
        subtitle: 'Powered by AI',
        content: 'Your presentation is ready to customize',
        layout: 'title',
        theme: 'gradient-blue',
        fontSize: 'large',
        alignment: 'center'
      },
      {
        id: 2,
        title: 'Key Features',
        content: '• AI-powered slide generation\n• Beautiful gradient themes\n• Multiple layout options\n• Easy customization\n• Export to PowerPoint',
        layout: 'content',
        theme: 'gradient-blue',
        fontSize: 'medium',
        alignment: 'left'
      },
      {
        id: 3,
        title: 'Get Started',
        content: '• Edit your slides with live preview\n• Change themes instantly\n• Add or remove slides easily\n• Download when ready',
        layout: 'content',
        theme: 'gradient-blue',
        fontSize: 'medium',
        alignment: 'left'
      }
    ];
    setSlides(demoSlides);
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: 'New Slide',
      subtitle: '',
      content: 'Click to edit this slide',
      layout: 'content',
      theme: slides[currentSlide]?.theme || 'gradient-blue',
      fontSize: 'medium',
      alignment: 'left'
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlide + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlide(currentSlide + 1);
  };

  const duplicateSlide = () => {
    const slideToDuplicate = { ...slides[currentSlide], id: Date.now() };
    const newSlides = [...slides];
    newSlides.splice(currentSlide + 1, 0, slideToDuplicate);
    setSlides(newSlides);
    setCurrentSlide(currentSlide + 1);
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    }
  };

  const updateSlide = (field, value) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = { ...newSlides[currentSlide], [field]: value };
    setSlides(newSlides);
  };

  const changeTheme = (themeId) => {
    updateSlide('theme', themeId);
  };

  const moveSlide = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= slides.length) return;
    const newSlides = [...slides];
    const [movedSlide] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, movedSlide);
    setSlides(newSlides);
    setCurrentSlide(toIndex);
  };

  const downloadPresentation = () => {
    const content = slides.map((slide, i) => 
      `Slide ${i + 1}:\nTitle: ${slide.title}\n${slide.subtitle ? `Subtitle: ${slide.subtitle}\n` : ''}Content: ${slide.content}\nLayout: ${slide.layout}\nTheme: ${slide.theme}\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.txt';
    a.click();
  };

  const getThemeClasses = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    return theme ? `bg-gradient-to-br ${theme.colors}` : 'bg-gradient-to-br from-blue-500 to-purple-600';
  };

  const getTextColor = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    return theme ? theme.textColor : 'text-white';
  };

  const renderSlideContent = (slide, isEditing = false) => {
    const textColor = getTextColor(slide.theme);
    const alignClass = slide.alignment === 'center' ? 'text-center' : slide.alignment === 'right' ? 'text-right' : 'text-left';
    
    if (slide.layout === 'title') {
      return (
        <div className={`h-full flex flex-col justify-center items-center ${textColor} ${alignClass} px-8`}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => updateSlide('title', e.target.value)}
                className="w-full text-5xl font-bold bg-transparent border-none outline-none mb-4 placeholder-white placeholder-opacity-50 text-center"
                placeholder="Main Title"
              />
              <input
                type="text"
                value={slide.subtitle || ''}
                onChange={(e) => updateSlide('subtitle', e.target.value)}
                className="w-full text-2xl bg-transparent border-none outline-none opacity-90 placeholder-white placeholder-opacity-50 text-center"
                placeholder="Subtitle (optional)"
              />
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
              {slide.subtitle && <p className="text-2xl opacity-90">{slide.subtitle}</p>}
            </>
          )}
        </div>
      );
    } else if (slide.layout === 'two-column') {
      return (
        <div className={`h-full flex flex-col ${textColor} p-8`}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => updateSlide('title', e.target.value)}
                className="text-4xl font-bold bg-transparent border-none outline-none mb-6 placeholder-white placeholder-opacity-50"
                placeholder="Slide Title"
              />
              <div className="flex-1 grid grid-cols-2 gap-8">
                <textarea
                  value={slide.content}
                  onChange={(e) => updateSlide('content', e.target.value)}
                  className="text-lg bg-transparent border-none outline-none resize-none placeholder-white placeholder-opacity-50"
                  placeholder="Left column content"
                />
                <textarea
                  value={slide.subtitle || ''}
                  onChange={(e) => updateSlide('subtitle', e.target.value)}
                  className="text-lg bg-transparent border-none outline-none resize-none placeholder-white placeholder-opacity-50"
                  placeholder="Right column content"
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-6">{slide.title}</h2>
              <div className="flex-1 grid grid-cols-2 gap-8">
                <div className="text-lg whitespace-pre-wrap">{slide.content}</div>
                <div className="text-lg whitespace-pre-wrap">{slide.subtitle}</div>
              </div>
            </>
          )}
        </div>
      );
    } else {
      return (
        <div className={`h-full flex flex-col ${textColor} ${alignClass} p-8`}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => updateSlide('title', e.target.value)}
                className="text-4xl font-bold bg-transparent border-none outline-none mb-6 placeholder-white placeholder-opacity-50"
                placeholder="Slide Title"
              />
              <textarea
                value={slide.content}
                onChange={(e) => updateSlide('content', e.target.value)}
                className="flex-1 text-xl bg-transparent border-none outline-none resize-none placeholder-white placeholder-opacity-50"
                placeholder="Slide Content (use bullet points with •)"
              />
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-6">{slide.title}</h2>
              <div className="flex-1 text-xl whitespace-pre-wrap leading-relaxed">{slide.content}</div>
            </>
          )}
        </div>
      );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">PPT Maker</h1>
            <p className="text-xs text-gray-500">AI-Powered Presentations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg flex items-center gap-2 transition shadow-md"
          >
            <Wand2 className="w-4 h-4" />
            AI Generate
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            title={viewMode === 'grid' ? 'List View' : 'Grid View'}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
          <button
            onClick={downloadPresentation}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-md"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      {/* AI Generation Panel */}
      {showAIPanel && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b px-6 py-4 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generatePresentation()}
                placeholder="Describe your presentation... (e.g., 'Create 5 slides about sustainable energy')"
                className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                disabled={isGenerating}
              />
              <button
                onClick={generatePresentation}
                disabled={isGenerating || !prompt.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition shadow-md"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails */}
        <aside className="w-72 bg-white border-r overflow-y-auto shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">Slides ({slides.length})</h2>
              <button
                onClick={addSlide}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition"
                title="Add Slide"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className={viewMode === 'grid' ? 'space-y-3' : 'space-y-2'}>
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden transition group ${
                    currentSlide === index 
                      ? 'ring-3 ring-purple-500 shadow-lg' 
                      : 'hover:ring-2 hover:ring-purple-300 shadow'
                  }`}
                >
                  <div className={`${viewMode === 'grid' ? 'aspect-video' : 'aspect-[16/6]'} ${getThemeClasses(slide.theme)} p-3 ${getTextColor(slide.theme)} text-xs relative`}>
                    <div className="font-semibold mb-1 line-clamp-1">{slide.title}</div>
                    {viewMode === 'grid' && (
                      <div className="opacity-80 line-clamp-2 text-[10px]">{slide.content}</div>
                    )}
                    
                    {/* Slide Number Badge */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded font-medium">
                      {index + 1}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSlide();
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition"
                        title="Duplicate"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {slides.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlide(index);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    {/* Move Arrows */}
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSlide(index, index - 1);
                        }}
                        className="absolute bottom-2 left-2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-1 rounded transition opacity-0 group-hover:opacity-100"
                        title="Move Up"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    )}
                    {index < slides.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSlide(index, index + 1);
                        }}
                        className="absolute bottom-2 right-2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-1 rounded transition opacity-0 group-hover:opacity-100"
                        title="Move Down"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Editor */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-100 to-gray-200 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Slide Preview */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-700">Slide {currentSlide + 1} of {slides.length}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                      disabled={currentSlide === 0}
                      className="p-2 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg shadow transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                      disabled={currentSlide === slides.length - 1}
                      className="p-2 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg shadow transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition shadow ${
                    editMode 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {editMode ? '✓ Done Editing' : '✏️ Edit Slide'}
                </button>
              </div>
              
              <div className={`aspect-video ${getThemeClasses(slides[currentSlide]?.theme)} rounded-2xl shadow-2xl overflow-hidden`}>
                {renderSlideContent(slides[currentSlide], editMode)}
              </div>
            </div>

            {/* Editor Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Themes */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Themes
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => changeTheme(theme.id)}
                      className={`relative rounded-lg overflow-hidden transition hover:scale-105 ${
                        slides[currentSlide]?.theme === theme.id ? 'ring-3 ring-purple-500' : ''
                      }`}
                      title={theme.name}
                    >
                      <div className={`aspect-video bg-gradient-to-br ${theme.colors}`}></div>
                      {slides[currentSlide]?.theme === theme.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layouts */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-purple-600" />
                  Layouts
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {layouts.map(layout => {
                    const Icon = layout.icon;
                    return (
                      <button
                        key={layout.id}
                        onClick={() => updateSlide('layout', layout.id)}
                        className={`p-4 rounded-xl border-2 transition hover:border-purple-400 ${
                          slides[currentSlide]?.layout === layout.id
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${
                          slides[currentSlide]?.layout === layout.id ? 'text-purple-600' : 'text-gray-600'
                        }`} />
                        <div className="text-xs text-center font-medium text-gray-700">{layout.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Alignment */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Text Alignment</h3>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map(align => (
                    <button
                      key={align}
                      onClick={() => updateSlide('alignment', align)}
                      className={`flex-1 p-3 rounded-lg border-2 transition ${
                        slides[currentSlide]?.alignment === align
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {align === 'left' && <AlignLeft className="w-5 h-5 mx-auto" />}
                      {align === 'center' && <AlignCenter className="w-5 h-5 mx-auto" />}
                      {align === 'right' && <AlignRight className="w-5 h-5 mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={addSlide}
                    className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Slide
                  </button>
                  <button
                    onClick={duplicateSlide}
                    className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate Slide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}