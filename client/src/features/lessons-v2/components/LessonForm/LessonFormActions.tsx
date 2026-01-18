type Props = {
  onSave: () => void;
  onCancel?: () => void;
  disabled?: boolean;
};

export function LessonFormActions({ onSave, onCancel, disabled }: Props) {
  return (
    <div>
      <button onClick={onSave} disabled={disabled}>
        Save
      </button>
      {onCancel && <button onClick={onCancel}>Cancel</button>}
    </div>
  );
}
