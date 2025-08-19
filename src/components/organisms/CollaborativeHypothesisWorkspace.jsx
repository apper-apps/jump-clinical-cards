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
  educationalMode = false,
  facilitatorView = false,
  educationalMetrics = {},
  learningMilestones = [],
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
  if (educationalMode) {
    switch (currentPhase) {
      case "individual":
        return "Educational Focus: Develop systematic clinical reasoning through independent hypothesis generation. Emphasize evidence-based rationales and thorough clinical thinking.";
      case "peer-review":
        return "Educational Focus: Engage in constructive peer assessment and collaborative learning. Provide evidence-based feedback and calibrate clinical judgments with peers.";
      case "synthesis":
        return "Educational Focus: Synthesize individual and peer insights into comprehensive group conclusions. Demonstrate consensus-building and reflective professional practice.";
      default:
        return "Comprehensive educational clinical reasoning workspace with structured learning progression.";
    }
  } else {
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
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-primary to-secondary text-white"
                  size="sm"
                >
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  {educationalMode ? "Create Learning Hypothesis" : "New Hypothesis"}
                </Button>
                
                {educationalMode && facilitatorView && (
                  <div className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
                    Learning Objective: {educationalMetrics?.learningObjectiveProgress || 0}% Complete
                  </div>
                )}
              </div>
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
<div className="mt-2 p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-blue-200">
                            <div className="mb-3">
                              <h5 className="text-sm font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                                <ApperIcon name="MessageSquareText" className="w-4 h-4 text-blue-600" />
                                <span>{educationalMode ? "Educational Assessment & Peer Learning" : "Hypothesis Discussion Thread"}</span>
                              </h5>
                              
                              {educationalMode && (
                                <div className="mb-2 p-2 bg-white rounded border">
                                  <div className="text-xs font-medium text-gray-700 mb-1">Learning Focus Areas:</div>
                                  <div className="flex flex-wrap gap-1">
                                    <Badge variant="outline" size="xs" className="text-blue-600 border-blue-300 bg-blue-50">
                                      Evidence Integration
                                    </Badge>
                                    <Badge variant="outline" size="xs" className="text-green-600 border-green-300 bg-green-50">
                                      Clinical Reasoning
                                    </Badge>
                                    <Badge variant="outline" size="xs" className="text-purple-600 border-purple-300 bg-purple-50">
                                      Peer Calibration
                                    </Badge>
                                    <Badge variant="outline" size="xs" className="text-orange-600 border-orange-300 bg-orange-50">
                                      Reflective Practice
                                    </Badge>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" size="xs" className="text-blue-600 border-blue-200">
                                  Evidence Evaluation
                                </Badge>
                                <Badge variant="outline" size="xs" className="text-green-600 border-green-200">
                                  Clinical Reasoning
                                </Badge>
                                <Badge variant="outline" size="xs" className="text-purple-600 border-purple-200">
                                  Alternative Perspective
                                </Badge>
                                {educationalMode && (
                                  <Badge variant="outline" size="xs" className="text-orange-600 border-orange-200">
                                    Educational Assessment
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex space-x-2">
                                <select className="text-xs border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                                  <option value="evidence-support">Support with Evidence</option>
                                  <option value="evidence-challenge">Challenge with Evidence</option>
                                  <option value="confidence-calibration">Confidence Discussion</option>
                                  <option value="alternative-reasoning">Alternative Reasoning</option>
                                  <option value="hypothesis-refinement">Refinement Suggestion</option>
                                  {educationalMode && (
                                    <>
                                      <option value="competency-assessment">Competency Assessment</option>
                                      <option value="learning-reflection">Learning Reflection</option>
                                      <option value="educational-feedback">Educational Feedback</option>
                                    </>
                                  )}
                                </select>
                              </div>
                              
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  placeholder={educationalMode ? 
                                    "Provide constructive educational feedback focusing on clinical reasoning and evidence integration..." : 
                                    "Provide evidence-based feedback on this hypothesis..."
                                  }
                                  className="flex-1 px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                      const discussionType = e.target.parentElement.previousElementSibling.querySelector('select').value;
                                      onAddComment(hypothesis.Id, {
                                        text: e.target.value,
                                        type: discussionType,
                                        category: educationalMode ? 'educational-assessment' : 'hypothesis-discussion'
                                      });
                                      e.target.value = '';
                                    }
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="px-3 py-2 h-auto"
                                  onClick={(e) => {
                                    const container = e.target.closest('.space-y-3');
                                    const input = container.querySelector('input');
                                    const select = container.querySelector('select');
                                    if (input.value.trim()) {
                                      onAddComment(hypothesis.Id, {
                                        text: input.value,
                                        type: select.value,
                                        category: educationalMode ? 'educational-assessment' : 'hypothesis-discussion'
                                      });
                                      input.value = '';
                                    }
                                  }}
                                >
                                  <ApperIcon name="Send" className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {/* Enhanced Confidence Calibration with Educational Context */}
                              <div className="pt-3 border-t border-gray-200">
                                <div className="text-xs font-medium text-gray-700 mb-2">
                                  {educationalMode ? "Educational Confidence Calibration & Peer Assessment:" : "Rate your confidence in this hypothesis:"}
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                  {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                      key={level}
                                      className="flex flex-col items-center p-2 rounded-lg border-2 border-gray-300 hover:border-primary transition-colors bg-white"
                                      onClick={() => {
                                        const educationalContext = educationalMode ? 
                                          `Educational assessment - Confidence level ${level}/5. This reflects my current understanding of the clinical reasoning process and evidence integration.` :
                                          `Confidence rating: ${level}/5`;
                                        
                                        onAddComment(hypothesis.Id, {
                                          text: educationalContext,
                                          type: 'confidence-calibration',
                                          category: 'peer-calibration',
                                          confidenceLevel: level,
                                          educationalContext: educationalMode
                                        });
                                      }}
                                    >
                                      <span className="text-lg font-bold text-primary">{level}</span>
                                      <span className="text-xs text-gray-600">
                                        {level === 1 && "Low"}
                                        {level === 2 && "Developing"}
                                        {level === 3 && "Moderate"}
                                        {level === 4 && "High"}
                                        {level === 5 && "Very High"}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                                
                                {educationalMode && (
                                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                                    <ApperIcon name="Lightbulb" className="w-3 h-3 inline mr-1" />
                                    <strong>Educational Tip:</strong> Consider your confidence in relation to available evidence, clinical experience, and peer perspectives. Confidence calibration is a key professional competency.
                                  </div>
                                )}
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