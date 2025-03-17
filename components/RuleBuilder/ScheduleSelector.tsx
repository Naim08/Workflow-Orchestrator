
import React, { useState, ChangeEvent, FormEvent } from 'react';

interface ScheduleSelectorProps {
  onSelect: (schedule: 'immediate' | 'delayed', delay?: number) => void;
  schedule?: 'immediate' | 'delayed';
  delay?: number;
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ 
  onSelect, 
  schedule = 'immediate', 
  delay = 60 
}) => {
  const [selectedSchedule, setSelectedSchedule] = useState<'immediate' | 'delayed'>(schedule);
  const [delayMinutes, setDelayMinutes] = useState<number>(delay);
  
  const handleScheduleChange = (scheduleType: 'immediate' | 'delayed'): void => {
    setSelectedSchedule(scheduleType);
  };
  
  const handleDelayChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDelayMinutes(parseInt(e.target.value) || 0);
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSelect(selectedSchedule, delayMinutes);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-medium mb-4">Step 3: Set Timing</h2>
      <p className="text-gray-600 mb-6">
        Choose when the action should be executed after the trigger occurs.
      </p>
      
      <div className="space-y-6 mb-8">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="immediate"
                name="schedule"
                type="radio"
                checked={selectedSchedule === 'immediate'}
                onChange={() => handleScheduleChange('immediate')}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="immediate" className="font-medium text-gray-700">Execute immediately</label>
              <p className="text-gray-500">Action will be performed as soon as the trigger event occurs.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="delayed"
                name="schedule"
                type="radio"
                checked={selectedSchedule === 'delayed'}
                onChange={() => handleScheduleChange('delayed')}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="delayed" className="font-medium text-gray-700">Execute after a delay</label>
              <p className="text-gray-500">Action will be performed after waiting for a specified time.</p>
            </div>
          </div>
        </div>
        
        {selectedSchedule === 'delayed' && (
          <div className="pl-7 border-l-2 border-gray-200">
            <div className="flex items-center">
              <div className="w-24">
                <label htmlFor="delayMinutes" className="label">Minutes</label>
                <input
                  type="number"
                  id="delayMinutes"
                  name="delayMinutes"
                  value={delayMinutes}
                  onChange={handleDelayChange}
                  min="1"
                  className="input"
                  required
                />
              </div>
              <div className="ml-4 text-gray-500">
                <p className="text-sm">The action will execute {delayMinutes} minutes after the trigger.</p>
                {delayMinutes >= 60 && (
                  <p className="text-xs mt-1">({Math.floor(delayMinutes / 60)} hours and {delayMinutes % 60} minutes)</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default ScheduleSelector;