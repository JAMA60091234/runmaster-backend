export const validatePersonalRecord = (record: string): { isValid: boolean; error?: string } => {
  // Remove extra spaces
  const trimmedRecord = record.trim();
  
  if (!trimmedRecord) {
    return { isValid: false, error: 'Personal record is required' };
  }

  // Check for common formats:
  // - "5K in 25 minutes"
  // - "10K in 55 minutes"
  // - "Half marathon in 1:45"
  // - "Marathon in 3:30"
  const pattern = /^(\d+(?:\.\d+)?[Kk]|Half marathon|Marathon)\s+in\s+(\d+)(?::(\d{2}))?\s*minutes?$/i;
  
  if (!pattern.test(trimmedRecord)) {
    return {
      isValid: false,
      error: 'Please use format: "5K in 25 minutes" or "Half marathon in 1:45"'
    };
  }

  return { isValid: true };
};

export const validateGoal = (goal: string): { isValid: boolean; error?: string } => {
  const trimmedGoal = goal.trim();
  
  if (!trimmedGoal) {
    return { isValid: false, error: 'Goal is required' };
  }

  if (trimmedGoal.length < 10) {
    return { isValid: false, error: 'Please provide a more detailed goal' };
  }

  return { isValid: true };
};

export const validateTargetDate = (date: Date | null): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: 'Target date is required' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return { isValid: false, error: 'Target date cannot be in the past' };
  }

  // Set maximum date to 1 year from now
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (date > maxDate) {
    return { isValid: false, error: 'Target date cannot be more than 1 year away' };
  }

  return { isValid: true };
}; 