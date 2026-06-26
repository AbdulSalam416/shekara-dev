export interface FriendlyError {
  title: string;
  message: string;
  type: 'resource_exhausted' | 'high_demand' | 'error';
  retryAfter?: string;
  link?: string;
  originalError?: string;
}

export function parseFriendlyError(rawMessage: string): FriendlyError {
  if (!rawMessage) {
    return {
      title: 'Extraction Failed',
      message: 'An unexpected error occurred during the knowledge graph extraction.',
      type: 'error',
    };
  }

  const upper = rawMessage.toUpperCase();

  // 1. Quota / Resource Exhaustion (429 / RESOURCE_EXHAUSTED)
  if (upper.includes('429') || upper.includes('RESOURCE_EXHAUSTED') || upper.includes('QUOTA')) {
    // Attempt to extract retry delay (e.g. "retry in 9.308452352s" or "retryDelay: '9s'")
    let retryAfter = '';
    const retryMatch = rawMessage.match(/retry in ([\d.]+\s*s?)/i) || rawMessage.match(/retryDelay': '([^']+)'/);
    if (retryMatch) {
      retryAfter = retryMatch[1];
      // Format cleanly (e.g., if "9.308452352s", format to "9.3 seconds")
      if (retryAfter.endsWith('s')) {
        const num = parseFloat(retryAfter.slice(0, -1));
        if (!isNaN(num)) {
          retryAfter = `${num.toFixed(1)} seconds`;
        }
      } else {
        const num = parseFloat(retryAfter);
        if (!isNaN(num)) {
          retryAfter = `${num.toFixed(1)} seconds`;
        }
      }
    }

    return {
      title: 'API Quota Exceeded (RESOURCE_EXHAUSTED)',
      message: 'You have exceeded the resource quota for the Gemini API. If you are using the free tier, there is a limit of 20 requests per day. Please check your plan and billing details.',
      type: 'resource_exhausted',
      retryAfter: retryAfter || undefined,
      link: 'https://ai.google.dev/gemini-api/docs/rate-limits',
      originalError: rawMessage,
    };
  }

  // 2. High Demand / Unavailable (503 / UNAVAILABLE)
  if (upper.includes('503') || upper.includes('UNAVAILABLE') || upper.includes('HIGH DEMAND')) {
    return {
      title: 'Service Temporarily Busy (503)',
      message: 'The AI model is experiencing a temporary spike in traffic. Spikes in demand are usually temporary and resolve quickly. Please wait a moment and try again.',
      type: 'high_demand',
      originalError: rawMessage,
    };
  }

  // 3. Fallback for other errors
  return {
    title: 'Extraction Failed',
    message: rawMessage,
    type: 'error',
  };
}
