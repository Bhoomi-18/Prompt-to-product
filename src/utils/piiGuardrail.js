/**
 * PII Guardrail Scrubber
 * Client-side regular expression sanitizer to protect sensitive customer data
 * before it hits any external LLM endpoint or internal log stream.
 */

// Matches common 13-19 digit credit card numbers (Visa, MasterCard, Amex, Discover, etc.) with spaces, hyphens, or continuous
export const CC_REGEX = /\b(?:\d[ -]*?){13,19}\b/g;

// Matches US Social Security Numbers formatted as XXX-XX-XXXX, XXX XX XXXX, or 9 continuous digits in SSN context
export const SSN_REGEX = /\b(?!(000|666|9\d{2}))\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/g;

// Matches API keys and secrets (Groq gsk_*, OpenAI sk-*, Bearer tokens, GitHub ghp_*, AWS AKIA keys)
export const API_KEY_REGEX = /\b(?:gsk_[a-zA-Z0-9]{20,}|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|Bearer\s+[a-zA-Z0-9\-._~+/]+=*)\b/gi;

/**
 * Validates whether a potential digit sequence is likely a credit card using the Luhn Algorithm.
 */
function isLuhnValid(cardNumber) {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Sanitizes input text, replacing sensitive PII with standardized redaction tokens.
 * @param {string} text 
 * @returns {{ sanitizedText: string, piiDetected: boolean, redactions: Array<{ type: string, match: string, token: string }> }}
 */
export function sanitizePii(text) {
  if (!text || typeof text !== "string") {
    return { sanitizedText: text, piiDetected: false, redactions: [] };
  }

  const redactions = [];
  let sanitized = text;

  // 1. Credit Card Numbers
  sanitized = sanitized.replace(CC_REGEX, (match) => {
    const rawDigits = match.replace(/[\s-]/g, "");
    // Check reasonable credit card length or Luhn validation (allow demo patterns too)
    if (rawDigits.length >= 13 && rawDigits.length <= 19) {
      redactions.push({
        type: "CREDIT_CARD",
        match,
        token: "[REDACTED-CC]"
      });
      return "[REDACTED-CC]";
    }
    return match;
  });

  // 2. Social Security Numbers
  sanitized = sanitized.replace(SSN_REGEX, (match) => {
    redactions.push({
      type: "SSN",
      match,
      token: "[REDACTED-SSN]"
    });
    return "[REDACTED-SSN]";
  });

  // 3. API Keys & Secrets
  sanitized = sanitized.replace(API_KEY_REGEX, (match) => {
    redactions.push({
      type: "API_KEY",
      match,
      token: "[REDACTED-KEY]"
    });
    return "[REDACTED-KEY]";
  });

  return {
    sanitizedText: sanitized,
    piiDetected: redactions.length > 0,
    redactions
  };
}
