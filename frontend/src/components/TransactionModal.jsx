import { useState, useEffect } from 'react';

/**
 * Reusable Transaction Modal Component
 * Used for adding/editing transactions in Cashbook, Customer, and Supplier modules
 * 
 * @param {boolean} show - Whether to show the modal
 * @param {function} onClose - Callback when modal is closed
 * @param {function} onSubmit - Callback when form is submitted (receives formData)
 * @param {object} initialData - Initial form data {amount, description, date}
 * @param {string} type - Transaction type: 'income', 'expense', 'debit', 'credit'
 * @param {string} mode - Modal mode: 'add' or 'edit'
 * @param {string} context - Context: 'cashbook', 'customer', 'supplier'
 * @param {boolean} submitting - Whether form is being submitted
 */
function TransactionModal({ 
  show, 
  onClose, 
  onSubmit, 
  initialData = { amount: '', description: '', date: new Date().toISOString().split('T')[0] },
  type = 'debit',
  mode = 'add',
  context = 'customer',
  submitting = false
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Reset errors when modal opens
  useEffect(() => {
    if (show) {
      setErrors({});
    }
  }, [show]);

  // Helper to sanitize numeric input (allow digits and one decimal point)
  const sanitizeNumericInput = (val) => {
    if (typeof val !== 'string') val = String(val || '');
    let s = val.replace(/,/g, '').replace(/[^0-9.]/g, '');
    const parts = s.split('.');
    if (parts.length > 2) {
      s = parts[0] + '.' + parts.slice(1).join('');
    }
    return s;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount || formData.amount === '0' || formData.amount === '0.') {
      newErrors.amount = 'Amount is required and must be greater than 0';
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    setErrors({});
    onClose();
  };

  // Get labels based on context and type
  const getLabels = () => {
    if (context === 'cashbook') {
      return {
        title: type === 'income' ? 'Income' : 'Expense',
        amountLabel: 'Amount (₹)',
        buttonColor: type === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600',
        amountPlaceholder: '0.00'
      };
    } else {
      // customer or supplier
      return {
        title: type === 'debit' ? 'Debit' : 'Credit',
        amountLabel: type === 'debit' ? 'You Gave (₹)' : 'You Got (₹)',
        buttonColor: type === 'debit' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
        amountPlaceholder: `Enter ${type} amount`
      };
    }
  };

  const labels = getLabels();

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'add' ? 'Add' : 'Edit'} {labels.title} {context === 'cashbook' ? '' : 'Transaction'}
          </h2>
          <button
            className="text-4xl text-gray-400 hover:text-gray-600 leading-none transition-colors"
            onClick={handleClose}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Date Field */}
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, date: e.target.value }));
                if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
              }}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <div className="text-red-600 text-sm mt-1">{errors.date}</div>}
          </div>

          {/* Amount Field */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
              {labels.amountLabel}
            </label>
            <input
              type="text"
              id="amount"
              inputMode="decimal"
              placeholder={labels.amountPlaceholder}
              value={formData.amount}
              onChange={(e) => {
                const sanitized = sanitizeNumericInput(e.target.value);
                setFormData(prev => ({ ...prev, amount: sanitized }));
                if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
              }}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amount && <div className="text-red-600 text-sm mt-1">{errors.amount}</div>}
          </div>

          {/* Description Field */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={context === 'cashbook' ? '2' : '3'}
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder={`Enter ${labels.title.toLowerCase()} description (optional)`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 font-medium rounded-lg transition-colors text-white disabled:opacity-70 disabled:cursor-not-allowed ${labels.buttonColor}`}
            >
              {submitting 
                ? (mode === 'add' ? 'Adding...' : 'Updating...') 
                : (mode === 'add' ? `Add ${labels.title}` : `Update ${labels.title}`)
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
