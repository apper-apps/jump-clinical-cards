import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";

const HypothesisModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  hypothesis = null,
  families = []
}) => {
  const [formData, setFormData] = useState({
    text: "",
    rationale: "",
    familyId: "",
    confidence: 3,
    isPrimary: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (hypothesis) {
      setFormData({
        text: hypothesis.text || "",
        rationale: hypothesis.rationale || "",
        familyId: hypothesis.familyId || "",
        confidence: hypothesis.confidence || 3,
        isPrimary: hypothesis.isPrimary || false
      });
    } else {
      setFormData({
        text: "",
        rationale: "",
        familyId: "",
        confidence: 3,
        isPrimary: false
      });
    }
    setErrors({});
  }, [hypothesis, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.text.trim()) {
      newErrors.text = "Hypothesis text is required";
    }
    if (!formData.rationale.trim()) {
      newErrors.rationale = "Rationale is required";
    }
    if (!formData.familyId) {
      newErrors.familyId = "Please select a family category";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        <motion.div
          className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {hypothesis ? "Edit Hypothesis" : "Create New Hypothesis"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <Input
              label="Hypothesis"
              placeholder="Enter your clinical hypothesis..."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              error={errors.text}
            />

            <Textarea
              label="Clinical Rationale"
              placeholder="Explain your reasoning and evidence supporting this hypothesis..."
              rows={4}
              value={formData.rationale}
              onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
              error={errors.rationale}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family Category
              </label>
              <select
                value={formData.familyId}
                onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a family category...</option>
                {families.map((family) => (
                  <option key={family.Id} value={family.Id}>
                    {family.name}
                  </option>
                ))}
              </select>
              {errors.familyId && (
                <p className="mt-1 text-sm text-error">{errors.familyId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Level: {formData.confidence}/5
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Low</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={formData.confidence}
                  onChange={(e) => setFormData({ ...formData, confidence: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-500">High</span>
              </div>
              <div className="flex justify-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-full ${
                      level <= formData.confidence ? "bg-accent" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                Mark as primary hypothesis
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-secondary text-white"
              >
                {hypothesis ? "Update Hypothesis" : "Create Hypothesis"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HypothesisModal;