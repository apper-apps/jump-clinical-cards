import { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import HypothesisCard from "@/components/molecules/HypothesisCard";
import HypothesisModal from "@/components/molecules/HypothesisModal";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";

const HypothesisWorkspace = ({ 
  hypotheses = [], 
  families = [],
  onAddHypothesis,
  onUpdateHypothesis,
  onDeleteHypothesis,
  className 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState(null);

  const handleSave = async (formData) => {
    try {
      if (editingHypothesis) {
        await onUpdateHypothesis(editingHypothesis.Id, formData);
        toast.success("Hypothesis updated successfully!");
      } else {
        await onAddHypothesis(formData);
        toast.success("Hypothesis created successfully!");
      }
      setEditingHypothesis(null);
    } catch (error) {
      console.error("Failed to save hypothesis:", error);
      toast.error("Failed to save hypothesis");
    }
  };

  const handleEdit = (hypothesis) => {
    setEditingHypothesis(hypothesis);
    setIsModalOpen(true);
  };

  const handleDelete = async (hypothesisId) => {
    if (window.confirm("Are you sure you want to delete this hypothesis?")) {
      try {
        await onDeleteHypothesis(hypothesisId);
        toast.success("Hypothesis deleted successfully!");
      } catch (error) {
        console.error("Failed to delete hypothesis:", error);
        toast.error("Failed to delete hypothesis");
      }
    }
  };

  const handleCreateNew = () => {
    setEditingHypothesis(null);
    setIsModalOpen(true);
  };

  const getFamilyForHypothesis = (familyId) => {
    return families.find(f => f.Id === familyId);
  };

  const unassignedHypotheses = hypotheses.filter(h => !h.familyId);
  const assignedHypotheses = hypotheses.filter(h => h.familyId);

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon name="FileText" className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900">
                Hypothesis Workspace
              </h3>
              <div className="text-sm text-gray-500">
                ({hypotheses.length} total)
              </div>
            </div>
            
            <Button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-primary to-secondary text-white"
              size="sm"
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              New Hypothesis
            </Button>
          </div>
        </div>

        <div className="p-4">
          {hypotheses.length === 0 ? (
            <Empty
              title="No hypotheses yet"
              description="Create your first clinical hypothesis to begin the reasoning process."
              actionText="Create Hypothesis"
              onAction={handleCreateNew}
              icon="Lightbulb"
            />
          ) : (
            <div className="space-y-6">
              {unassignedHypotheses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                    <ApperIcon name="Clock" className="w-4 h-4 text-warning" />
                    <span>Unassigned Hypotheses ({unassignedHypotheses.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {unassignedHypotheses.map((hypothesis) => (
                      <motion.div
                        key={hypothesis.Id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <HypothesisCard
                          hypothesis={hypothesis}
                          family={getFamilyForHypothesis(hypothesis.familyId)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {assignedHypotheses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                    <ApperIcon name="CheckCircle" className="w-4 h-4 text-success" />
                    <span>Categorized Hypotheses ({assignedHypotheses.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assignedHypotheses.map((hypothesis) => (
                      <motion.div
                        key={hypothesis.Id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <HypothesisCard
                          hypothesis={hypothesis}
                          family={getFamilyForHypothesis(hypothesis.familyId)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <HypothesisModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHypothesis(null);
        }}
        onSave={handleSave}
        hypothesis={editingHypothesis}
        families={families}
      />
    </div>
  );
};

export default HypothesisWorkspace;