import { useId, useState } from "react";
import { IconLoader } from "./icons";

const MAX_LENGTH = 1500;

export default function SymptomForm({ onSubmit, isLoading }) {
  const [value, setValue] = useState("");
  const textareaId = useId();
  const hintId = useId();

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  }

  return (
    <form className="symptom-form" onSubmit={handleSubmit}>
      <label htmlFor={textareaId} className="symptom-form__label">
        Describe tus síntomas
      </label>
      <textarea
        id={textareaId}
        aria-describedby={hintId}
        className="symptom-form__textarea"
        placeholder="Ej: tengo fiebre de 38.5°C desde ayer, tos seca y dolor muscular. No tengo enfermedades previas."
        value={value}
        maxLength={MAX_LENGTH}
        onChange={(event) => setValue(event.target.value)}
        disabled={isLoading}
        rows={6}
      />
      <div className="symptom-form__footer">
        <p id={hintId} className="symptom-form__hint">
          Incluye edad, duración, intensidad y antecedentes relevantes si los tienes.
          ({value.length}/{MAX_LENGTH})
        </p>
        <button
          type="submit"
          className="button button--primary"
          disabled={isLoading || !value.trim()}
        >
          {isLoading ? (
            <>
              <IconLoader width={18} height={18} />
              Analizando…
            </>
          ) : (
            "Evaluar síntomas"
          )}
        </button>
      </div>
    </form>
  );
}
