import React from 'react';

const AIControlPanel = ({
  onRegenerateTitle,
  onRegenerateBullets,
  onRegenerateSlide,
  isLoading
}) => {
  return (
    <div className="ai-control-panel">
      <h2 className="panel-title">AI Controls</h2>

      <div className="control-section">
        <h3 className="section-title">Regenerate Content</h3>
        <div className="control-group">
          <button
            className="control-button"
            onClick={onRegenerateTitle}
            disabled={isLoading}
          >
            <span className="control-icon">🎯</span>
            <span className="control-label">Regenerate Title</span>
          </button>

          <button
            className="control-button"
            onClick={onRegenerateBullets}
            disabled={isLoading}
          >
            <span className="control-icon">📝</span>
            <span className="control-label">Regenerate Bullets</span>
          </button>

          <button
            className="control-button"
            onClick={onRegenerateSlide}
            disabled={isLoading}
          >
            <span className="control-icon">🔄</span>
            <span className="control-label">Regenerate Entire Slide</span>
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3 className="section-title">Tips</h3>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', lineHeight: '1.5' }}>
          <p>• Use "Regenerate Title" to get a better slide heading</p>
          <p>• Use "Regenerate Bullets" to improve the content points</p>
          <p>• Use "Regenerate Entire Slide" for a complete rewrite</p>
          <p>• Changes only affect the current slide</p>
        </div>
      </div>
    </div>
  );
};

export default AIControlPanel;