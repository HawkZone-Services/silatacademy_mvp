import { Progress } from "@/components/ui/progress";

export function LockedItem({
  label,
  current,
  required,
  rate,
  minRate,
  passed,
  type = "count",
}: any) {
  const value =
    type === "count" ? (current / required) * 100 : passed ? 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {type === "count"
            ? `${current} / ${required}`
            : passed
            ? "Passed"
            : "Not passed"}
        </span>
      </div>

      <Progress value={value} />

      {!passed && (
        <p className="text-xs text-red-500">{label} requirement not met</p>
      )}
    </div>
  );
}
