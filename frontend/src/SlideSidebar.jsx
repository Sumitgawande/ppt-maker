import React from 'react';

const SlideSidebar = ({ slides, activeSlideIndex, onSlideSelect }) => {
  return (
    <div className="slide-sidebar">
      <h2 className="sidebar-title">Presentation Slides</h2>
      <div className="slide-list">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide-item ${index === activeSlideIndex ? 'active' : ''}`}
            onClick={() => onSlideSelect(index)}
          >
            <div className="slide-number">Slide {index + 1}</div>
            <div className="slide-title">
              {slide.title || `Slide ${index + 1}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideSidebar;