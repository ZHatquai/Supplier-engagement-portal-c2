import { CONTACT_FIELDS } from '../data/contactSchema'

// The six identity fields that open both routes. Same markup on both screens so
// the two capture screens cannot drift apart.
export default function ContactFields({ values, errors, onChange, disabled }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {CONTACT_FIELDS.map((field) => (
        <div key={field.id} className={field.id === 'company_name' ? 'md:col-span-2' : ''}>
          <label htmlFor={field.id} className="tc-label block mb-2">
            {field.label}
            <span className="text-ink"> *</span>
          </label>
          <input
            id={field.id}
            name={field.id}
            type={field.type || 'text'}
            autoComplete={field.autoComplete}
            disabled={disabled}
            value={values[field.id] ?? ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={`tc-input ${errors[field.id] ? 'tc-error' : ''}`}
            aria-invalid={errors[field.id] ? 'true' : undefined}
          />
          {errors[field.id] && <p className="text-[12px] text-ink mt-2">{errors[field.id]}</p>}
        </div>
      ))}
    </div>
  )
}
