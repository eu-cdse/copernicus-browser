export const PROVIDER_TOO_MANY_REQUESTS_INDICATOR = '(429) Too Many Requests';

const INTERNAL_PREFIX_REGEX = /^Research [A-Za-z]+:\s*/;
const FIELD_PATH_PREFIX_REGEX = /^[A-Za-z_]\w*(\.\w+)+=/;

export const NO_OPPORTUNITIES_INDICATOR = 'No theoretical opportunities found with informed data';

export const isProviderTooManyRequestsMessage = (message: unknown): boolean => {
  return typeof message === 'string' && message.includes(PROVIDER_TOO_MANY_REQUESTS_INDICATOR);
};

export const getThrottledProviderName = (message: string): string | null => {
  const withoutInternalPrefix = message.replace(INTERNAL_PREFIX_REGEX, '');
  if (withoutInternalPrefix === message) {
    return null;
  }
  const providerMatch = withoutInternalPrefix.match(/^([^:]+?):\s/);
  const provider = providerMatch ? providerMatch[1].trim() : null;
  // A real provider segment is a single identifier (e.g. "planetscope"); if the match spans
  // multiple words it's actually prose from a message with no provider segment at all, e.g.
  // "Research CCME: The remote server returned an error: (429) Too Many Requests."
  return provider && !/\s/.test(provider) ? provider : null;
};

// Parses the JSON body that the backend embeds inside an error string. Callers pick the regex, since
// the unified `message` can span lines while the legacy `error` string is matched on its first line only.
export const parseEmbeddedJson = (
  text: string,
  pattern: RegExp = /{[\s\S]*}/,
): Record<string, unknown> | null => {
  const jsonMatch = text.match(pattern);
  if (!jsonMatch) {
    return null;
  }
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('Failed to parse embedded JSON error:', parseError);
    return null;
  }
};

export const extractRRDErrorMessage = (message: unknown): string | null => {
  if (typeof message !== 'string' || message.trim() === '') {
    return null;
  }

  const json = parseEmbeddedJson(message);
  if (json) {
    if (Array.isArray(json.non_field_errors) && typeof json.non_field_errors[0] === 'string') {
      return json.non_field_errors[0];
    }
    if (Array.isArray(json.errors)) {
      const errorWithMessage = json.errors.find(
        (err): err is { message: string } => typeof err?.message === 'string' && err.message.trim() !== '',
      );
      if (errorWithMessage) {
        return errorWithMessage.message;
      }
    }
  }

  if (INTERNAL_PREFIX_REGEX.test(message)) {
    const withoutInternalPrefix = message.replace(INTERNAL_PREFIX_REGEX, '');
    const withoutFieldPathPrefix = withoutInternalPrefix.replace(FIELD_PATH_PREFIX_REGEX, '');
    return withoutFieldPathPrefix.trim();
  }

  return message.trim();
};

export const isRRDStringErrorFlag = (error: unknown): error is 'true' | 'false' => {
  return error === 'true' || error === 'false';
};

export const isRRDErrorResponse = (data: unknown): boolean => {
  return (data as { error?: unknown })?.error === 'true';
};

export const isNoOpportunitiesMessage = (message: unknown): boolean => {
  return typeof message === 'string' && message.includes(NO_OPPORTUNITIES_INDICATOR);
};
