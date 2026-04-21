import React, { useState } from 'react';

const ExportPanel = ({ presentationData, onExport, onBack }) => {
  const [exportFormat, setExportFormat] = useState('pptx');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportFormat);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const slideCount = presentationData?.slides?.length || 0;

  return (
    <div className="export-panel">
      <h2 className="export-title">Export Your Presentation</h2>
      <p className="export-summary">
        Your presentation has {slideCount} slide{slideCount !== 1 ? 's' : ''} ready for export.
      </p>

      <div className="form-group">
        <label className="form-label">Export Format</label>
        <select
          className="form-input"
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
        >
          <option value="pptx">PowerPoint (.pptx)</option>
          <option value="pdf">PDF Document (.pdf)</option>
        </select>
      </div>

      <div className="export-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
          disabled={isExporting}
        >
          Back to Editor
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
};

export default ExportPanel;