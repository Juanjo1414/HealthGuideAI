import { IconAlertCircle } from "./icons";

export default function HumanReviewAlert() {
  return (
    <div className="human-review-alert" role="alert">
      <IconAlertCircle className="human-review-alert__icon" />
      <p>
        El sistema recomienda valoración por un profesional de salud. HealthGuide AI no
        contacta ni asigna automáticamente a ese profesional: debes buscar la atención indicada.
      </p>
    </div>
  );
}
