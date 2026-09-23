import { IconStethoscope } from "./icons";

export default function DisclaimerBanner() {
  return (
    <div className="disclaimer-banner" role="note">
      <IconStethoscope className="disclaimer-banner__icon" />
      <p>
        HealthGuide AI orienta sobre prioridad de atención. <strong>No diagnostica, no
        prescribe medicamentos y no reemplaza a un profesional de salud.</strong>
      </p>
    </div>
  );
}
