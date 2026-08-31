export default function FieldInput({ field, value, error, onChange, disabled }) {
  const common = {
    id: field.id,
    disabled,
    value: value ?? '',
    onChange: (e) => onChange(field.id, e.target.value),
  }

  return (
    <div>
      <label htmlFor={field.id} className="tc-label block mb-2">
        {field.label}
        {field.required && <span className="text-ink"> *</span>}
        {field.unit && <span className="normal-case tracking-normal text-stone"> &nbsp;({field.unit})</span>}
      </label>

      {field.type === 'text' && (
        <input type="text" className={`tc-input ${error ? 'tc-error' : ''}`} {...common} />
      )}

      {field.type === 'number' && (
        <input type="number" inputMode="decimal" className={`tc-input ${error ? 'tc-error' : ''}`} {...common} />
      )}

      {field.type === 'textarea' && (
        <textarea rows={4} className={`tc-textarea ${error ? 'tc-error' : ''}`} {...common} />
      )}

      {field.type === 'dropdown' && (
        <select className={`tc-select ${error ? 'tc-error' : ''}`} {...common}>
          <option value="">Select…</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {field.flag && value === field.flag.equals && (
        <p className="text-[11px] text-stone mt-2 border-l-2 border-lime pl-3">{field.flag.note}</p>
      )}

      {error && <p className="text-[12px] text-ink mt-2">{error}</p>}
    </div>
  )
}
