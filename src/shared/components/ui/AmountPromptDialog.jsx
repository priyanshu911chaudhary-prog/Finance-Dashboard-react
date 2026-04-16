import { Modal } from './Modal';

export function AmountPromptDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  label = 'Amount',
  defaultValue = '100',
  submitLabel = 'Save',
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) return;
    onSubmit(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-xs text-muted font-medium">{label}</label>
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={defaultValue}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
            placeholder="0.00"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
