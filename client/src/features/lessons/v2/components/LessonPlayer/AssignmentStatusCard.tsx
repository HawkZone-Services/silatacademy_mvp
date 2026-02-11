import { AssignmentStatus } from "../../types/lesson.types";

type Props = {
  required: boolean;
  status?: AssignmentStatus;
  rejectionReason?: string; // optional
  onSubmit?: () => void; // placeholder
};

export function AssignmentStatusCard({ required, status, onSubmit }: Props) {
  if (!required) return null;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
      }}
    >
      <h4>Practical Assignment</h4>

      {status === "pending" && (
        <p style={{ color: "orange" }}>
          ⏳ Assignment submitted. Waiting for instructor review.
        </p>
      )}

      {status === "approved" && (
        <p style={{ color: "green" }}>
          ✅ Assignment approved. You may complete the lesson.
        </p>
      )}

      {status === "rejected" && (
        <>
          <p style={{ color: "red" }}>❌ Assignment rejected.</p>
          {rejectionReason && <p>Reason: {rejectionReason}</p>}
          <button onClick={onSubmit}>Re-submit Assignment</button>
        </>
      )}

      {!status && (
        <>
          <p>📹 This lesson requires a video submission before completion.</p>
          <button onClick={onSubmit}>Submit Assignment</button>
        </>
      )}
    </div>
  );
}
