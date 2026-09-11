import { IconAlertCircle } from "./icons";

export default function HumanReviewAlert() {
  return (
    <div className="human-review-alert" role="alert">
      <IconAlertCircle className="human-review-alert__icon" />
      <p>
        Este caso necesita revisión de un profesional de salud antes de tomar una
        decisión. No te bases únicamente en esta orientación.
      </p>
    </div>
  );
}
