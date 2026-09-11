import { getPriorityMeta } from "../constants/priority";
import { IconCheckCircle, IconInfo, IconAlertTriangle, IconAlertCircle } from "./icons";

const ICONS = {
  BAJA: IconCheckCircle,
  MEDIA: IconInfo,
  ALTA: IconAlertTriangle,
  EMERGENCIA: IconAlertCircle,
};

export default function PriorityBadge({ priority }) {
  const meta = getPriorityMeta(priority);
  const Icon = ICONS[priority] ?? IconInfo;

  return (
    <div className={`priority-badge ${meta.className}`} role="status">
      <Icon className="priority-badge__icon" />
      <div>
        <p className="priority-badge__label">{meta.label}</p>
        <p className="priority-badge__description">{meta.description}</p>
      </div>
    </div>
  );
}
