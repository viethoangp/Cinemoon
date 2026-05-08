/**
 * Build a standardized JSON response
 * @param {boolean} success - Success status
 * @param {string} message - Response message (Vietnamese)
 * @param {object} data - Response data
 * @returns {object} Formatted response
 */
export function buildResponse(success, message, data = {}) {
  return {
    success,
    message,
    data,
  };
}
