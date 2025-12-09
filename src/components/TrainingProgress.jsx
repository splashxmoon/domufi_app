import React, { useState, useEffect } from 'react';

const TrainingProgress = ({ isVisible, progress, onComplete }) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (isVisible && progress) {
      setDisplayProgress(progress.accuracy * 100);
    }
  }, [isVisible, progress]);

  if (!isVisible) return null;

  return (
    <div className="training-progress-overlay">
      <div className="training-progress-container">
        <div className="training-progress-header">
          <h3>🚀 AI Training in Progress</h3>
          <p>Watching the AI learn in real-time...</p>
        </div>

        <div className="training-progress-content">
          <div className="progress-metrics">
            <div className="metric">
              <span className="metric-label">Accuracy</span>
              <span className="metric-value">{displayProgress.toFixed(1)}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Confidence</span>
              <span className="metric-value">{((progress?.confidence || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Epoch</span>
              <span className="metric-value">{progress?.epoch || 0}</span>
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${displayProgress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {displayProgress < 50 ? 'Learning basics...' :
               displayProgress < 75 ? 'Improving understanding...' :
               displayProgress < 90 ? 'Optimizing performance...' :
               'Achieving peak accuracy...'}
            </div>
          </div>

          {progress?.isLearning && (
            <div className="learning-indicator">
              <span className="learning-icon">📈</span>
              <span>AI is learning effectively!</span>
            </div>
          )}

          {progress?.recommendations && progress.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>💡 Recommendations:</h4>
              <ul>
                {progress.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="training-progress-footer">
          <button 
            className="close-progress-btn"
            onClick={onComplete}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingProgress;

