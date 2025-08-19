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
  currentStage = 1,
  onAddHypothesis,
  onUpdateHypothesis,
  onDeleteHypothesis,
  onSubmitForReview,
  onAddComment,
  onAddDiscussionThread,
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
<div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                            <div className="mb-2">
                              <h5 className="text-xs font-medium text-gray-700 mb-1">
                                Hypothesis Discussion Thread
                              </h5>
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant="outline" size="xs" className="text-blue-600 border-blue-200">
                                  Evidence Evaluation
                                </Badge>
                                <Badge variant="outline" size="xs" className="text-green-600 border-green-200">
                                  Clinical Reasoning
                                </Badge>
                                <Badge variant="outline" size="xs" className="text-purple-600 border-purple-200">
                                  Alternative Perspective
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex space-x-1">
                                <select className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary">
                                  <option value="evidence-support">Support with Evidence</option>
                                  <option value="evidence-challenge">Challenge with Evidence</option>
                                  <option value="confidence-calibration">Confidence Discussion</option>
                                  <option value="alternative-reasoning">Alternative Reasoning</option>
                                  <option value="hypothesis-refinement">Refinement Suggestion</option>
                                </select>
                              </div>
                              
                              <div className="flex space-x-1">
                                <input
                                  type="text"
                                  placeholder="Provide evidence-based feedback on this hypothesis..."
                                  className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                      const discussionType = e.target.parentElement.previousElementSibling.querySelector('select').value;
                                      onAddComment(hypothesis.Id, {
                                        text: e.target.value,
                                        type: discussionType,
                                        category: 'hypothesis-discussion'
                                      });
                                      e.target.value = '';
                                    }
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-6 w-6"
                                  onClick={(e) => {
                                    const container = e.target.closest('.space-y-2');
                                    const input = container.querySelector('input');
                                    const select = container.querySelector('select');
                                    if (input.value.trim()) {
                                      onAddComment(hypothesis.Id, {
                                        text: input.value,
                                        type: select.value,
                                        category: 'hypothesis-discussion'
                                      });
                                      input.value = '';
                                    }
                                  }}
                                >
                                  <ApperIcon name="Send" className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              {/* Confidence Calibration Tool */}
                              <div className="pt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-600 mb-1">
                                  Rate your confidence in this hypothesis:
                                </div>
                                <div className="flex items-center space-x-2">
                                  {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                      key={level}
                                      className="w-6 h-6 rounded-full border-2 border-gray-300 text-xs hover:border-primary transition-colors"
                                      onClick={() => {
                                        onAddComment(hypothesis.Id, {
                                          text: `Confidence rating: ${level}/5`,
                                          type: 'confidence-calibration',
                                          category: 'peer-calibration',
                                          confidenceLevel: level
                                        });
                                      }}
                                    >
                                      {level}
                                    </button>
                                  ))}
                                </div>
                              </div>
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