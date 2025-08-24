import React, { useState } from 'react';
import Button from '../Common/Button';

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reopen Task</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            You are about to reopen the task <span className="font-semibold">"{task?.title}"</span>. 
            Please set a new deadline for this task.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="newDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                New Deadline
              </label>
              <input
                type="date"
                id="newDeadline"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !newDeadline}
                loading={loading}
              >
                Reopen Task
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReopenTaskModal;