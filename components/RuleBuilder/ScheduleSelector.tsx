// components/RuleBuilder/ScheduleSelector.tsx
import React, { useState } from 'react';

interface ScheduleSelectorProps {
  schedule: string;
  delay: number;
  onScheduleChange: (schedule: string) => void;
  onDelayChange: (delay: number) => void;
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  schedule,
  delay,
  onScheduleChange,
  onDelayChange
}) => {
  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScheduleChange(e.target.value);
  };
  
  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDelayChange(parseInt(e.target.value, 10));
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-3">When should the action be executed?</label>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="schedule-immediate"
              name="schedule"
              value="immediate"
              checked={schedule === 'immediate'}
              onChange={handleScheduleChange}
              className="h-4 w-4 text-blue-600 border-gray-300"
            />
            <label htmlFor="schedule-immediate" className="ml-2 block text-sm text-gray-700">
              Execute immediately when triggered
            </label>
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                type="radio"
                id="schedule-delayed"
                name="schedule"
                value="delayed"
                checked={schedule === 'delayed'}
                onChange={handleScheduleChange}
                className="h-4 w-4 text-blue-600 border-gray-300"
              />
              <label htmlFor="schedule-delayed" className="ml-2 block text-sm text-gray-700">
                Execute after a delay
              </label>
            </div>
            
            {schedule === 'delayed' && (
              <div className="mt-2 ml-6">
                <div className="flex items-center">
                  <input
                    type="number"
                    value={delay}
                    onChange={handleDelayChange}
                    min="1"
                    max="10080" // 1 week in minutes
                    className="w-20 border rounded px-3 py-2 mr-2"
                  />
                  <span className="text-sm text-gray-700">minutes</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Delay can be between 1 minute and 1 week (10080 minutes)
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="schedule-cron"
              name="schedule"
              value="cron"
              checked={schedule === 'cron'}
              onChange={handleScheduleChange}
              className="h-4 w-4 text-blue-600 border-gray-300"
            />
            <label htmlFor="schedule-cron" className="ml-2 block text-sm text-gray-700">
              Execute on a schedule (cron)
            </label>
          </div>
          
          {schedule === 'cron' && (
            <div className="mt-2 ml-6 space-y-2">
              <p className="text-xs text-gray-700">
                For scheduled triggers, use the 'scheduled_time' trigger type rather than this option.
                This will ensure your rule runs on a proper schedule rather than after a trigger event.
              </p>
              <button
                type="button"
                onClick={() => onScheduleChange('immediate')}
                className="text-blue-600 text-xs underline"
              >
                Switch to immediate execution
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded border">
        <h4 className="text-sm font-medium">Schedule Information</h4>
        <p className="text-xs text-gray-600 mt-1">
          {schedule === 'immediate' ? (
            'The action will execute as soon as the trigger occurs.'
          ) : schedule === 'delayed' ? (
            `The action will execute ${delay} minutes after the trigger occurs.`
          ) : (
            'For recurring schedules, please use the scheduled_time trigger type instead.'
          )}
        </p>
      </div>
    </div>
  );
};

export default ScheduleSelector;