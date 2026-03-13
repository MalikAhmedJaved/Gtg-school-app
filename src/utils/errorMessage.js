const STATUS_FALLBACK_MESSAGES = {
  400: 'Request is invalid. Please check your input and try again.',
  401: 'You are not authorized. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'Service is temporarily unavailable. Please try again in a moment.',
  409: 'This record already exists. Please use different details.',
  422: 'Some fields are invalid. Please review your input.',
  429: 'Too many requests. Please wait and try again.',
  500: 'Server error. Please try again later.',
  502: 'Server is unreachable right now. Please try again shortly.',
  503: 'Service is unavailable right now. Please try again shortly.',
  504: 'Server timed out. Please try again.',
};

const normalizeText = (value) => {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
};

const looksLikeHtml = (text) => /<\s*!doctype\s+html|<\s*html|<\s*head|<\s*body|<\s*title|<\s*div|<\s*p\b/i.test(text);

const getFriendlyMessageFromHtml = (html) => {
  if (/malformed\s+host\s+header/i.test(html)) {
    return 'Service is temporarily unavailable. Please try again in a moment.';
  }

  if (/not\s+found|404/i.test(html)) {
    return STATUS_FALLBACK_MESSAGES[404];
  }

  if (/bad\s+request|400/i.test(html)) {
    return STATUS_FALLBACK_MESSAGES[400];
  }

  if (/server\s+error|500|502|503|504/i.test(html)) {
    return STATUS_FALLBACK_MESSAGES[500];
  }

  return null;
};

const extractMessageFromData = (data) => {
  if (!data) return null;

  if (typeof data === 'string') {
    const text = normalizeText(data);
    if (!text) return null;
    if (looksLikeHtml(text)) {
      return getFriendlyMessageFromHtml(text);
    }
    return text;
  }

  if (Array.isArray(data)) {
    const items = data.map((item) => normalizeText(item)).filter(Boolean);
    return items.length ? items.join(', ') : null;
  }

  if (typeof data === 'object') {
    const candidates = [
      normalizeText(data.message),
      normalizeText(data.error),
      normalizeText(data.detail),
      normalizeText(data.title),
    ].filter(Boolean);

    if (candidates.length) return candidates[0];

    if (Array.isArray(data.errors)) {
      const errorItems = data.errors
        .map((item) => {
          if (typeof item === 'string') return normalizeText(item);
          if (item && typeof item === 'object') {
            return normalizeText(item.message) || normalizeText(item.msg) || normalizeText(item.error);
          }
          return null;
        })
        .filter(Boolean);

      if (errorItems.length) return errorItems.join(', ');
    }
  }

  return null;
};

const isAxiosStatusMessage = (message) => /^Request failed with status code \d{3}$/.test(message);

const normalizeBusinessMessage = (message) => {
  if (!message) return null;

  if (/already\s+registered|email\s+already\s+exists|duplicate\s+email/i.test(message)) {
    return 'This email is already registered. Please use a different email or login.';
  }

  return message;
};

export const getApiErrorMessage = (error, fallbackMessage = 'Something went wrong. Please try again.') => {
  const status = error?.response?.status;
  const responseData = error?.response?.data;

  let message =
    extractMessageFromData(responseData) ||
    normalizeText(error?.message) ||
    null;

  if (message && isAxiosStatusMessage(message)) {
    message = null;
  }

  message = normalizeBusinessMessage(message);

  if (message) {
    return message;
  }

  if (status && STATUS_FALLBACK_MESSAGES[status]) {
    return STATUS_FALLBACK_MESSAGES[status];
  }

  return fallbackMessage;
};
