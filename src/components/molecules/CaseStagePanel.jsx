import { motion } from "framer-motion";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const CaseStagePanel = ({ 
  stages, 
  currentStage, 
  onStageSelect,
  stageConfirmation = {},
  onStageConfirmation,
  className
}) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border", className)}>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0">
          {stages.map((stage, index) => {
            const stageNumber = index + 1;
            const isActive = currentStage === stageNumber;
            const isUnlocked = stage.unlocked || stageNumber <= currentStage;
            const isCompleted = stageNumber < currentStage;
            
            return (
<div
                key={stage.Id}
                className="relative"
              >
                <button
                onClick={() => isUnlocked && onStageSelect?.(stageNumber)}
                className={cn(
                  "case-stage-tab flex-1 min-w-0 relative",
                  isActive && "active",
                  !isActive && isUnlocked && "inactive",
                  !isUnlocked && "locked"
                )}
                disabled={!isUnlocked}
              >
                <div className="flex items-center justify-center space-x-2 px-3 py-2">
                  <div className={cn(
"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200",
                    isActive ? "bg-primary text-white ring-2 ring-primary/30" : 
                    isCompleted ? "bg-success text-white" : 
                    isUnlocked ? "bg-gray-200 text-gray-600 hover:bg-gray-300" : 
                    "bg-gray-100 text-gray-400"
                  )}>
                    {isCompleted ? (
                      <ApperIcon name="Check" className="w-4 h-4" />
                    ) : !isUnlocked ? (
                      <ApperIcon name="Lock" className="w-4 h-4" />
                    ) : (
                      stageNumber
                    )}
                  </div>
                  
                  {/* Progress Line */}
                  {stageNumber < stages.length && (
                    <div className="absolute top-4 left-8 w-16 h-0.5 bg-gray-200">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          isCompleted ? "bg-success" : "bg-gray-200"
                        )}
                      />
                    </div>
                  )}
                  
                  <div className="ml-3 flex-1">
                    <span className={cn(
                      "text-sm font-medium block",
                      isActive ? "text-primary" : 
                      isCompleted ? "text-success" : 
                      isUnlocked ? "text-gray-700" : "text-gray-400"
                    )}>
{stage.title}
                  </span>
                </div>
                </div>
                
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
                )}
              </button>
              </div>
            );
          })}
        </nav>
      </div>
      
      <div className="p-6">
        {stages.map((stage, index) => {
          const stageNumber = index + 1;
          const isActive = currentStage === stageNumber;
          
          if (!isActive) return null;
          
          return (
            <motion.div
              key={stage.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <ApperIcon name="FileText" className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {stage.title}
                </h3>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {stage.content}
                </p>
              </div>
              
{/* Stage Navigation Controls */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  {currentStage > 1 && (
                    <button
                      onClick={() => onStageSelect?.(currentStage - 1)}
                      className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <ApperIcon name="ChevronLeft" className="w-4 h-4" />
                      <span>Previous Stage</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {/* Stage Completion Confirmation */}
{!stageConfirmation[currentStage] && (
                  <button
                    onClick={() => onStageConfirmation?.(currentStage, true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-accent to-success text-white rounded-lg hover:from-accent/90 hover:to-success/90 transition-all duration-200 shadow-md"
                  >
                    <ApperIcon name="CheckCircle" className="w-4 h-4" />
                    <span>Complete Educational Milestone</span>
                  </button>
                )}
                
                {stageConfirmation[currentStage] && (
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-success text-white rounded-lg">
                    <ApperIcon name="CheckCircle" className="w-4 h-4" />
                    <span>Learning Milestone Achieved</span>
                  </div>
                )}
                  
                  {/* Next Stage Button */}
                  {currentStage < stages.length && stageConfirmation[currentStage] && (
                    <button
                      onClick={() => onStageSelect?.(currentStage + 1)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:from-primary/90 hover:to-secondary/90 transition-all duration-200"
                    >
                      <span>Next Stage</span>
                      <ApperIcon name="ChevronRight" className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stage Progress Summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Progress: Stage {currentStage} of {stages.length}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium text-success">
                      {Object.keys(stageConfirmation).length}/{stages.length}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(Object.keys(stageConfirmation).length / stages.length) * 100}%` 
                    }}
                  />
</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseStagePanel;