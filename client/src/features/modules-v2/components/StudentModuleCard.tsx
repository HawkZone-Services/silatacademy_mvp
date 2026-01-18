export function StudentModuleCard({ module }: any) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold">{module.title}</h3>
      <p>Type: {module.moduleType}</p>
      <p>Belt: {module.beltLevel}</p>

      {/* optional */}
      {module.progressPercent != null && (
        <p>Progress: {module.progressPercent}%</p>
      )}
    </div>
  );
}
