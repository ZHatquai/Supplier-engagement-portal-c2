// Company and contact identity captured at the opening step of both routes
// (product-spec v3.0 §5). All six fields are required on both routes. Email is
// format-validated, phone is not. The EcoVadis route additionally requires a
// URL-validated scorecard link.

export const EHS_EMAIL = 'sustainability@thecorporate.com'

export const ECOVADIS_URL = 'https://ecovadis.com'

export const CONTACT_FIELDS = [
  { id: 'company_name', label: 'Company name', autoComplete: 'organization' },
  { id: 'contact_name', label: 'Contact full name', autoComplete: 'name' },
  { id: 'contact_email', label: 'Contact email', type: 'email', autoComplete: 'email' },
  { id: 'contact_phone', label: 'Contact phone', type: 'tel', autoComplete: 'tel' },
  { id: 'job_title', label: 'Job title', autoComplete: 'organization-title' },
  { id: 'department', label: 'Department', autoComplete: 'off' },
]

export const EMPTY_CONTACT = Object.fromEntries(CONTACT_FIELDS.map((f) => [f.id, '']))

export const DATA_STATEMENT =
  'Your data will be stored securely and used only to process and review your company’s ' +
  'sustainability assessment submission for The Corporate’s supplier program. You can request ' +
  `deletion at any time by contacting ${EHS_EMAIL}.`

export const CONSENT_LABEL =
  'I have read the statement above and consent to The Corporate storing and processing these details.'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return 'This field is required.'
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address.'
  return null
}

export function validateUrl(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return 'This field is required.'
  let parsed
  try {
    parsed = new URL(trimmed)
  } catch {
    return 'Enter a full URL, starting with https://.'
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return 'Enter a full URL, starting with https://.'
  }
  return null
}

// Returns a map of field id -> message. An empty map means the set is valid.
export function validateContact(values) {
  const errors = {}
  CONTACT_FIELDS.forEach((field) => {
    const value = String(values[field.id] ?? '').trim()
    if (field.id === 'contact_email') {
      const error = validateEmail(value)
      if (error) errors[field.id] = error
      return
    }
    if (!value) errors[field.id] = 'This field is required.'
  })
  return errors
}
