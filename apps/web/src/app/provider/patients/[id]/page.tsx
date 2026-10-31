import { PatientDetail } from "./patient-detail";

// Static export: the provider demo always shows the single synthetic patient.
export function generateStaticParams() {
  return [{ id: "demo-patient-1" }];
}
export const dynamicParams = false;

export default function PatientDetailPage() {
  return <PatientDetail />;
}
