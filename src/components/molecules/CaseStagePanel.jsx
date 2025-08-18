import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const CaseStagePanel = ({ 
  stages, 
  currentStage, 
  onStageSelect,
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
              <button
                key={stage.Id}
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
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    isActive ? "bg-primary text-white" : 
                    isCompleted ? "bg-success text-white" : 
                    isUnlocked ? "bg-gray-200 text-gray-600" : 
                    "bg-gray-100 text-gray-400"
                  )}>
                    {isCompleted ? (
                      <ApperIcon name="Check" className="w-3 h-3" />
                    ) : !isUnlocked ? (
                      <ApperIcon name="Lock" className="w-3 h-3" />
                    ) : (
                      stageNumber
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {stage.title}
                  </span>
                </div>
                
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
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
              
              {stageNumber < stages.length && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => onStageSelect?.(stageNumber + 1)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:from-primary/90 hover:to-secondary/90 transition-all duration-200"
                  >
                    <span>Unlock Next Stage</span>
                    <ApperIcon name="ChevronRight" className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseStagePanel;