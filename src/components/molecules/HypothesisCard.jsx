import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const HypothesisCard = ({ 
  hypothesis, 
  family,
  onEdit,
  onDelete,
  isDragging = false,
  className 
}) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("hypothesisId", hypothesis.Id.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.div
      className={cn(
        "hypothesis-card p-4 relative",
        isDragging && "drag-preview",
        className
      )}
      draggable
      onDragStart={handleDragStart}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        borderTopColor: family?.color || "#94A3B8"
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">
            {hypothesis.text}
          </h4>
          {hypothesis.rationale && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {hypothesis.rationale}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-1 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(hypothesis)}
            className="p-1 h-auto"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(hypothesis.Id)}
            className="p-1 h-auto text-error hover:text-error hover:bg-error/10"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          {family && (
            <span 
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-white font-medium"
              style={{ backgroundColor: family.color }}
            >
              <ApperIcon name={family.icon} className="w-3 h-3" />
              <span>{family.name}</span>
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <span>Confidence:</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  "w-2 h-2 rounded-full",
                  level <= (hypothesis.confidence || 3)
                    ? "bg-accent"
                    : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
      </div>
      
      {hypothesis.isPrimary && (
        <div className="absolute top-2 right-2">
          <ApperIcon 
            name="Star" 
            className="w-4 h-4 text-warning fill-current" 
          />
        </div>
      )}
    </motion.div>
  );
};

export default HypothesisCard;