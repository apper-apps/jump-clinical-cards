import { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import HypothesisCard from "@/components/molecules/HypothesisCard";
import HypothesisModal from "@/components/molecules/HypothesisModal";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";

const CollaborativeHypothesisWorkspace = ({ 
  hypotheses = [], 
  families = [],
  group = {},
  currentPhase = "individual",
  onAddHypothesis,
  onUpdateHypothesis,
  onDeleteHypothesis,
  onSubmitForReview,
  onAddComment,
  className 
}) => {
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
    // Only allow editing own hypotheses in individual phase
    if (currentPhase === "individual" && hypothesis.authorId === "current-user") {
      setEditingHypothesis(hypothesis);
    }
  };

  const handleDelete = async (hypothesisId) => {
    const hypothesis = hypotheses.find(h => h.Id === hypothesisId);
    if (hypothesis?.authorId !== "current-user" && currentPhase !== "synthesis") {
      toast.error("You can only delete your own hypotheses");
      return;
    }

    try {
      await onDeleteHypothesis(hypothesisId);
      toast.success("Hypothesis deleted successfully!");
    } catch (error) {
      console.error("Failed to delete hypothesis:", error);
      toast.error("Failed to delete hypothesis");
    }
  };

  const handleSubmitForReview = async (hypothesisId) => {
    try {
      await onSubmitForReview(hypothesisId);
      toast.success("Hypothesis submitted for peer review!");
    } catch (error) {
      toast.error("Failed to submit for review");
    }
  };

  const handleCreateNew = () => {
    if (currentPhase === "peer-review") {
      toast.warning("Create new hypotheses during individual work phase");
      return;
    }
    setEditingHypothesis(null);
  };

  const getFamilyForHypothesis = (familyId) => {
    return families.find(family => family.Id === familyId);
  };

  // Group hypotheses by author and status
  const myHypotheses = hypotheses.filter(h => h.authorId === "current-user");
  const peerHypotheses = hypotheses.filter(h => h.authorId !== "current-user");
  const pendingReviewHypotheses = hypotheses.filter(h => h.status === "pending-review");

  const getPhaseInstructions = () => {
    switch (currentPhase) {
      case "individual":
        return "Generate your individual hypotheses based on the case information. Focus on quality clinical reasoning.";
      case "peer-review":
        return "Review peer hypotheses and provide constructive feedback. Consider their reasoning and evidence.";
      case "synthesis":
        return "Collaborate to synthesize the best hypotheses into group conclusions.";
      default:
        return "Collaborative clinical reasoning workspace.";
    }
  };

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ApperIcon name="FileText" className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Collaborative Hypothesis Workspace
                </h3>
                <p className="text-sm text-gray-600">
                  {getPhaseInstructions()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="info" size="sm">
                {hypotheses.length} Total
              </Badge>
              
              {currentPhase === "individual" && (
                <Button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-primary to-secondary text-white"
                  size="sm"
                >
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  New Hypothesis
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          {hypotheses.length === 0 ? (
            <Empty
              title="No hypotheses yet"
              description="Start the collaborative process by creating your first clinical hypothesis."
              actionText="Create Hypothesis"
              onAction={handleCreateNew}
              icon="Lightbulb"
            />
          ) : (
            <div className="space-y-6">
              {/* My Hypotheses */}
              {myHypotheses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                    <ApperIcon name="User" className="w-4 h-4 text-primary" />
                    <span>My Hypotheses ({myHypotheses.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {myHypotheses.map((hypothesis) => (
                      <motion.div
                        key={hypothesis.Id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
                        <HypothesisCard
                          hypothesis={hypothesis}
                          family={getFamilyForHypothesis(hypothesis.familyId)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          showCollaborativeInfo={true}
                        />
                        
                        {/* Submit for Review Button */}
                        {currentPhase === "individual" && hypothesis.status !== "pending-review" && (
                          <div className="mt-2">
                            <Button
                              onClick={() => handleSubmitForReview(hypothesis.Id)}
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                            >
                              <ApperIcon name="Send" className="w-3 h-3 mr-1" />
                              Submit for Review
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Peer Hypotheses */}
              {peerHypotheses.length > 0 && currentPhase !== "individual" && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                    <ApperIcon name="Users" className="w-4 h-4 text-info" />
                    <span>Peer Hypotheses ({peerHypotheses.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {peerHypotheses.map((hypothesis) => (
                      <motion.div
                        key={hypothesis.Id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
                        <HypothesisCard
                          hypothesis={hypothesis}
                          family={getFamilyForHypothesis(hypothesis.familyId)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          showCollaborativeInfo={true}
                        />
                        
                        {/* Comment Section for Peer Review */}
                        {currentPhase === "peer-review" && (
                          <div className="mt-2 p-2 bg-gray-50 rounded border">
                            <div className="flex space-x-1">
                              <input
                                type="text"
                                placeholder="Add feedback or suggestion..."
                                className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    onAddComment(hypothesis.Id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-6 w-6"
                                onClick={(e) => {
                                  const input = e.target.closest('.mt-2').querySelector('input');
                                  if (input.value.trim()) {
                                    onAddComment(hypothesis.Id, input.value);
                                    input.value = '';
                                  }
                                }}
                              >
                                <ApperIcon name="Send" className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Review Section */}
              {pendingReviewHypotheses.length > 0 && currentPhase === "peer-review" && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                    <ApperIcon name="Eye" className="w-4 h-4 text-warning" />
                    <span>Pending Review ({pendingReviewHypotheses.length})</span>
                  </h4>
                  <div className="text-sm text-gray-600 mb-3">
                    These hypotheses are ready for peer review and feedback.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingReviewHypotheses.map((hypothesis) => (
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
                          showCollaborativeInfo={true}
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

      {/* Hypothesis Modal */}
      {editingHypothesis !== undefined && (
        <HypothesisModal
          hypothesis={editingHypothesis}
          families={families}
          isOpen={true}
          onClose={() => setEditingHypothesis(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CollaborativeHypothesisWorkspace;