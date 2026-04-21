import React, { useState, useEffect } from 'react';

const SlideEditor = ({ slide, onSlideUpdate, isLoading }) => {
  const [title, setTitle] = useState(slide?.title || '');
  const [bullets, setBullets] = useState(slide?.bullets || ['']);

  useEffect(() => {
    if (slide) {
      setTitle(slide.title || '');
      setBullets(slide.bullets || ['']);
    }
  }, [slide]);

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    onSlideUpdate({
      ...slide,
      title: newTitle,
      bullets
    });
  };

  const handleBulletChange = (index, value) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    setBullets(newBullets);
    onSlideUpdate({
      ...slide,
      title,
      bullets: newBullets
    });
  };

  const addBullet = () => {
    const newBullets = [...bullets, ''];
    setBullets(newBullets);
    onSlideUpdate({
      ...slide,
      title,
      bullets: newBullets
    });
  };

  const removeBullet = (index) => {
    if (bullets.length > 1) {
      const newBullets = bullets.filter((_, i) => i !== index);
      setBullets(newBullets);
      onSlideUpdate({
        ...slide,
        title,
        bullets: newBullets
      });
    }
  };

  if (!slide) {
    return (
      <div className="slide-editor">
        <div className="editor-title">Select a slide to edit</div>
      </div>
    );
  }

  return (
    <div className="slide-editor">
      <h2 className="editor-title">Edit Slide</h2>

      {/* Slide Preview */}
      <div className="slide-preview">
        <h3 className="preview-title">{title || 'Slide Title'}</h3>
        <div className="bullet-list">
          {bullets.filter(bullet => bullet.trim()).map((bullet, index) => (
            <div key={index} className="bullet-item">
              <span className="bullet-marker">•</span>
              <span className="bullet-text">{bullet}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editable Fields */}
      <div className="editor-section">
        <h3 className="section-title">Slide Title</h3>
        <input
          type="text"
          className="input-field"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter slide title..."
          disabled={isLoading}
        />
      </div>

      <div className="editor-section">
        <h3 className="section-title">Bullet Points</h3>
        <div className="bullet-editor">
          {bullets.map((bullet, index) => (
            <div key={index} className="bullet-input">
              <span className="bullet-marker">•</span>
              <input
                type="text"
                className="input-field"
                value={bullet}
                onChange={(e) => handleBulletChange(index, e.target.value)}
                placeholder="Enter bullet point..."
                disabled={isLoading}
              />
              {bullets.length > 1 && (
                <button
                  type="button"
                  className="remove-bullet"
                  onClick={() => removeBullet(index)}
                  title="Remove bullet point"
                  disabled={isLoading}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-bullet"
            onClick={addBullet}
            disabled={isLoading}
          >
            + Add Bullet Point
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default SlideEditor;