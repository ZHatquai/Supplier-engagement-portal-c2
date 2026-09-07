// The browser's only path to the database. Both calls go to the server-side
// Netlify Function, which holds the Supabase service role key. No Supabase
// client, URL, or key exists anywhere in this bundle — see CLAUDE.md Hard Rules.

const ENDPOINT = '/.netlify/functions/submissions'

async function post(body) {
  let response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('The submission service could not be reached. Check your connection and try again.')
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'The submission could not be completed. Try again in a moment.')
  }
  return payload
}

// Advisory check used to warn before submitting. Never blocks — a failed check
// returns "no duplicate" so a service hiccup cannot stop a supplier submitting.
export async function checkDuplicate({ companyName, route }) {
  try {
    return await post({ action: 'check', company_name: companyName, route })
  } catch {
    return { duplicate: false, kind: 'none' }
  }
}

export async function submitSubmission(submission) {
  return post({ action: 'submit', ...submission })
}
