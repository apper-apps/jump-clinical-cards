import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const FamilyCard = ({ 
  family, 
  hypotheses = [], 
  onDrop, 
  isDragOver,
  className 
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const hypothesisId = e.dataTransfer.getData("hypothesisId");
    if (hypothesisId && onDrop) {
      onDrop(parseInt(hypothesisId), family.Id);
    }
  };

  const assignedHypotheses = hypotheses.filter(h => h.familyId === family.Id);

  return (
    <motion.div
      className={cn(
        "family-card p-4 relative",
        isDragOver && "drop-zone-active",
        className
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
        style={{ backgroundColor: family.color }}
      />
      
      <div className="flex items-start space-x-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${family.color}20` }}
        >
          <ApperIcon 
            name={family.icon} 
            className="w-5 h-5"
            style={{ color: family.color }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 mb-1">
            {family.name}
          </h3>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            {family.description}
          </p>
          
          {assignedHypotheses.length > 0 && (
            <div className="space-y-2">
              {assignedHypotheses.map((hypothesis) => (
                <motion.div
                  key={hypothesis.Id}
                  className="text-xs bg-gray-50 rounded p-2 border-l-2"
                  style={{ borderLeftColor: family.color }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="font-medium text-gray-800 mb-1">
                    {hypothesis.text}
                  </div>
                  {hypothesis.rationale && (
                    <div className="text-gray-600">
                      {hypothesis.rationale}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          
          {assignedHypotheses.length === 0 && (
            <div className="text-xs text-gray-400 italic border-2 border-dashed border-gray-200 rounded p-3 text-center">
              Drop hypothesis here
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute top-2 right-2">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: family.color }}
        >
          {assignedHypotheses.length}
        </div>
      </div>
    </motion.div>
  );
};

export default FamilyCard;