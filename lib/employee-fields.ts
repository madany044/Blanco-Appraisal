import { employeeFormSchema } from "./validations/employee-form.schema";

// Explicit employee schema allowlist; never return reviewer fields or salary.
export function employeeAnswers(record: Record<string, unknown>) {
  return Object.fromEntries(Object.keys(employeeFormSchema.shape)
    .filter((key) => key !== "currentSalary" && record[key] != null)
    .map((key) => [key, record[key]]));
}
