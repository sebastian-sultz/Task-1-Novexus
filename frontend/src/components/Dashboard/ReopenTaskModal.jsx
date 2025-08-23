import React, { useState } from 'react';

const ReopenTaskModal = ({ isOpen, onClose, onConfirm, task, loading }) => {
  const [newDeadline, setNewDeadline] = useState('');
  
  // Set default deadline to 7 days from now when modal opens
  React.useEffect(() => {
    if (isOpen && task) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setNewDeadline(nextWeek.toISOString().split('T')[0]);
    }
  }, [isOpen, task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newDeadline) {
      onConfirm(newDeadline);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Reopen Task</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p>You are about to reopen the task "{task?.title}". Please set a new deadline for this task.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newDeadline">New Deadline</label>
              <input
                type="date"
                id="newDeadline"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="form-control"
              />
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                onClick={onClose}
                disabled={loading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !newDeadline}
                className="btn btn-primary"
              >
                {loading ? 'Reopening...' : 'Reopen Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReopenTaskModal;