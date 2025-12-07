import { ConditionalRules, LogicCondition } from '../types';

/**
 * pure function to determine if a question should be shown
 * based on the current state of answers.
 */
export const shouldShowQuestion = (
  rules: ConditionalRules | null,
  answersSoFar: Record<string, any>
): boolean => {
  // If no rules exist, show the question by default
  if (!rules || rules.conditions.length === 0) {
    return true;
  }

  // Helper to evaluate a single condition
  const evaluateCondition = (condition: LogicCondition): boolean => {
    const answer = answersSoFar[condition.fieldId];

    // If the referenced answer is missing/undefined/null, logic fails safe (false)
    // unless checking for "notEquals"
    if (answer === undefined || answer === null || answer === '') {
      return condition.operator === 'notEquals';
    }

    const targetValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        // Handle array comparison (for multi-selects acting as single value check? rare but possible)
        // Usually equals is strictly for single values
        return String(answer) === String(targetValue);

      case 'notEquals':
        return String(answer) !== String(targetValue);

      case 'contains':
        // If answer is an array (Multiselect), does it contain the target?
        if (Array.isArray(answer)) {
          return answer.includes(targetValue);
        }
        // If answer is a string, does it contain the substring?
        return String(answer).toLowerCase().includes(String(targetValue).toLowerCase());

      default:
        return false;
    }
  };

  // Evaluate all conditions
  const results = rules.conditions.map(evaluateCondition);

  // Combine results based on Gate
  if (rules.logic === 'AND') {
    return results.every((r) => r === true);
  } else {
    // OR
    return results.some((r) => r === true);
  }
};
