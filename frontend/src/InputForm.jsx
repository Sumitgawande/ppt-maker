import React, { useState } from 'react';

const InputForm = ({ onGenerate, error }) => {
  const [formData, setFormData] = useState({
    topic: '',
    presentationType: 'business',
    audience: '',
    goal: '',
    keyPoints: [''],
    theme: 'blue'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKeyPointChange = (index, value) => {
    const newKeyPoints = [...formData.keyPoints];
    newKeyPoints[index] = value;
    setFormData(prev => ({
      ...prev,
      keyPoints: newKeyPoints
    }));
  };

  const addKeyPoint = () => {
    setFormData(prev => ({
      ...prev,
      keyPoints: [...prev.keyPoints, '']
    }));
  };

  const removeKeyPoint = (index) => {
    if (formData.keyPoints.length > 1) {
      const newKeyPoints = formData.keyPoints.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        keyPoints: newKeyPoints
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Filter out empty key points
      const filteredKeyPoints = formData.keyPoints.filter(point => point.trim() !== '');

      await onGenerate({
        topic: formData.topic,
        presentation_type: formData.presentationType,
        audience: formData.audience,
        goal: formData.goal,
        key_points: filteredKeyPoints,
        theme: formData.theme,
      });
    } catch (error) {
      console.error('Error generating presentation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = formData.topic.trim() && formData.audience.trim() && formData.goal.trim() &&
                     formData.keyPoints.some(point => point.trim() !== '');

  return (
    <div className="input-form">
      <h1 className="form-title">Create Your Presentation</h1>
      <p className="form-subtitle">
        Fill in the details below to generate a structured, professional presentation
      </p>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="topic">
            Presentation Topic *
          </label>
          <input
            type="text"
            id="topic"
            className="form-input"
            placeholder="e.g., Q4 Financial Results, Product Launch Strategy"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="presentationType">
            Presentation Type
          </label>
          <select
            id="presentationType"
            className="form-input"
            value={formData.presentationType}
            onChange={(e) => handleInputChange('presentationType', e.target.value)}
          >
            <option value="business">Business Presentation</option>
            <option value="academic">Academic/Research</option>
            <option value="sales">Sales Pitch</option>
            <option value="training">Training/Education</option>
            <option value="product">Product Demo</option>
            <option value="strategy">Strategic Planning</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="theme">
            Color Theme
          </label>
          <select
            id="theme"
            className="form-input"
            value={formData.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
          >
            <option value="blue">Blue (Professional)</option>
            <option value="green">Green (Growth)</option>
            <option value="purple">Purple (Creative)</option>
            <option value="orange">Orange (Energy)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="audience">
            Target Audience *
          </label>
          <input
            type="text"
            id="audience"
            className="form-input"
            placeholder="e.g., Executive Team, Board Members, Customers"
            value={formData.audience}
            onChange={(e) => handleInputChange('audience', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="goal">
            Presentation Goal *
          </label>
          <textarea
            id="goal"
            className="form-input form-textarea"
            placeholder="What do you want to achieve with this presentation? e.g., Secure funding, Communicate strategy, Train team members"
            value={formData.goal}
            onChange={(e) => handleInputChange('goal', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Key Points to Cover *
          </label>
          <div className="key-points-list">
            {formData.keyPoints.map((point, index) => (
              <div key={index} className="key-point-input">
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Key point ${index + 1}`}
                  value={point}
                  onChange={(e) => handleKeyPointChange(index, e.target.value)}
                />
                {formData.keyPoints.length > 1 && (
                  <button
                    type="button"
                    className="remove-point"
                    onClick={() => removeKeyPoint(index)}
                    title="Remove this key point"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="add-point"
            onClick={addKeyPoint}
          >
            + Add Key Point
          </button>
        </div>

        <button
          type="submit"
          className="generate-button"
          disabled={!isFormValid || isGenerating}
        >
          {isGenerating ? 'Generating Presentation...' : 'Generate Presentation'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;