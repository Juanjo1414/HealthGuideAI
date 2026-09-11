import PriorityBadge from "./PriorityBadge";
import HumanReviewAlert from "./HumanReviewAlert";

function TagList({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <p className="result-card__empty">{emptyText}</p>;
  }
  return (
    <ul className="tag-list">
      {items.map((item) => (
        <li key={item} className="tag-list__item">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ResultCard({ result }) {
  const {
    prioridad,
    resumen,
    sintomas_detectados: sintomas,
    posibles_causas: causas,
    alertas,
    recomendacion,
    requires_human_review: requiresReview,
    confianza,
  } = result;

  return (
    <section className="result-card" aria-live="polite" tabIndex={-1}>
      <PriorityBadge priority={prioridad} />

      {requiresReview && <HumanReviewAlert />}

      <div className="result-card__section">
        <h3>Resumen</h3>
        <p>{resumen}</p>
      </div>

      <div className="result-card__section">
        <h3>Síntomas detectados</h3>
        <TagList items={sintomas} emptyText="No se identificaron síntomas específicos." />
      </div>

      <div className="result-card__section">
        <h3>Posibles causas generales</h3>
        <p className="result-card__caveat">
          No es un diagnóstico — solo orientación general.
        </p>
        <TagList items={causas} emptyText="No hay suficiente información para sugerir causas." />
      </div>

      {alertas && alertas.length > 0 && (
        <div className="result-card__section result-card__section--alert">
          <h3>Alertas</h3>
          <TagList items={alertas} emptyText="" />
        </div>
      )}

      <div className="result-card__section result-card__section--recommendation">
        <h3>Recomendación</h3>
        <p>{recomendacion}</p>
      </div>

      <p className="result-card__confidence">
        Confianza del modelo: {Math.round(confianza * 100)}%
      </p>
    </section>
  );
}
