import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { toast } from "react-toastify";

const DiscussionPanel = ({ session, group, onAddComment, onClose }) => {
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("message");
  const [discussionCategory, setDiscussionCategory] = useState("general");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mock discussion data - in real app would come from session
const discussions = session?.discussions || [
    {
      Id: 1,
      type: "system",
      category: "general",
      message: "Group discussion started. Share your thoughts on the clinical reasoning process.",
      timestamp: "10:30 AM",
      authorName: "System"
    },
    {
      Id: 2,
      type: "facilitator-prompt",
      category: "evidence-analysis",
      message: "I think we should focus more on red flags before considering disc herniation. What do you all think?",
      timestamp: "10:32 AM",
      authorName: "Dr. Sarah Johnson",
      authorId: "facilitator-1",
      sbarStructure: {
        situation: "Patient presenting with lower back pain",
        background: "No previous surgical history, works desk job",
        assessment: "Need to rule out serious pathology first",
        recommendation: "Systematic red flag assessment before considering disc pathology"
      }
    },
    {
      Id: 3,
      type: "student-response",
      category: "evidence-analysis",
      message: "Good point! The patient history doesn't mention any alarming symptoms like bowel/bladder issues.",
      timestamp: "10:35 AM",
      authorName: "Emily Chen",
      authorId: "student-1",
      confidenceLevel: 4,
      referencesEvidence: true
    },
    {
      Id: 4,
      type: "reflection",
      category: "metacognition",
      message: "I'm realizing I jumped to conclusions about disc herniation without properly considering red flags. This case is teaching me about systematic clinical reasoning.",
      timestamp: "10:38 AM",
      authorName: "Michael Rodriguez",
      authorId: "student-2",
      reflectionType: "assumption-challenge"
    }
  ];

  // Get stage-specific discussion prompts
  const getStagePrompts = (stage) => {
    const prompts = {
      1: { // Initial Presentation
        title: "Initial Presentation Discussion",
        prompts: [
          "What initial impressions do you have based on the presenting complaint?",
          "What additional information would be most valuable at this stage?",
          "What assumptions are we making about this case?"
        ]
      },
      2: { // History
        title: "History Stage Dialogue", 
        prompts: [
          "How does this new information change your thinking?",
          "What patterns are emerging from the patient history?",
          "Which historical findings support or challenge your initial impressions?"
        ]
      },
      3: { // Examination
        title: "Examination Discussions",
        prompts: [
          "Which findings support or challenge our hypotheses?",
          "What examination gaps remain that could influence our reasoning?",
          "How confident are we in our clinical findings?"
        ]
      },
      4: { // Investigation
        title: "Investigation Analysis",
        prompts: [
          "How do these results influence our clinical reasoning?",
          "What are the implications for management planning?",
          "What would we do differently if we encountered this case again?"
        ]
      }
    };
    return prompts[stage] || prompts[1];
  };

  const currentStagePrompts = getStagePrompts(session?.currentStage || 1);

  // Professional communication templates
  const communicationTemplates = {
    sbar: {
      name: "SBAR Communication",
      placeholder: "Structure your response using SBAR format:\nSituation: What's happening?\nBackground: Relevant context?\nAssessment: Your clinical judgement?\nRecommendation: What should be done?"
    },
    evidence: {
      name: "Evidence-Based Argument",
      placeholder: "Present your argument with supporting evidence:\n1. Clinical finding/observation\n2. Supporting evidence from case\n3. Clinical reasoning\n4. Confidence level (1-5)"
    },
    challenge: {
      name: "Respectful Challenge",
      placeholder: "Constructively challenge this perspective:\n- Acknowledge the valid points\n- Present alternative viewpoint\n- Support with evidence\n- Invite discussion"
    },
    reflection: {
      name: "Reflective Practice",
      placeholder: "Reflect on your clinical reasoning:\n- What assumptions am I making?\n- How confident am I and why?\n- What would I do differently next time?"
    },
    synthesis: {
      name: "Group Synthesis",
      placeholder: "Help synthesize group thinking:\n- Key points of agreement\n- Areas of uncertainty\n- Next steps for reasoning"
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [discussions]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      // In real app, would call discussion API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNewMessage("");
      toast.success("Message sent!");
      inputRef.current?.focus();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type, authorId) => {
    if (type === "system") return "Info";
    if (authorId?.includes("facilitator")) return "GraduationCap";
    return "User";
  };

  const getMessageColor = (type, authorId) => {
    if (type === "system") return "text-info";
    if (authorId?.includes("facilitator")) return "text-primary";
    return "text-gray-900";
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border h-full flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Header */}
<div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ApperIcon name="MessageSquare" className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-gray-900">Evidence-Based Discussion</h3>
            <p className="text-sm text-gray-600">
              {group?.participants?.length || 0} participants • {currentStagePrompts.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Facilitator Dashboard Indicator */}
          {group?.facilitatorId === "current-user" && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded text-xs">
              <ApperIcon name="Eye" className="w-3 h-3 text-blue-600" />
              <span className="text-blue-700">Facilitator View</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <ApperIcon name="X" className="w-4 h-4" />
          </Button>
        </div>
      </div>
{/* Stage-Integrated Discussion Prompts */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <ApperIcon name="Lightbulb" className="w-4 h-4 mr-2 text-primary" />
          {currentStagePrompts.title}
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          {currentStagePrompts.prompts.map((prompt, index) => (
            <div key={index} className="flex items-start space-x-2">
              <ApperIcon name="HelpCircle" className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
              <span className="leading-relaxed">{prompt}</span>
            </div>
          ))}
        </div>
        
        {/* Facilitator Intervention Tools */}
        {group?.facilitatorId === "current-user" && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <h5 className="text-xs font-medium text-blue-800 mb-2">Facilitator Tools</h5>
            <div className="flex flex-wrap gap-1">
              <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                Guide Discussion
              </button>
              <button className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                Prompt Evidence
              </button>
              <button className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">
                Encourage Synthesis
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Communication Template Selector */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <ApperIcon name="MessageTemplate" className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Discussion Format:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(communicationTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedTemplate === key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>
      {/* Messages */}
<div className="flex-1 overflow-y-auto p-4 space-y-4">
        {discussions.map((message) => (
          <motion.div
            key={message.Id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <ApperIcon 
                name={getMessageIcon(message.type, message.authorId)} 
                className="w-4 h-4 text-gray-600" 
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-sm font-medium ${getMessageColor(message.type, message.authorId)}`}>
                  {message.authorName}
                </span>
                <span className="text-xs text-gray-500">{message.timestamp}</span>
                
                {/* Role and Category Badges */}
                {message.authorId?.includes("facilitator") && (
                  <Badge variant="info" size="xs">Facilitator</Badge>
                )}
                {message.category && message.category !== "general" && (
                  <Badge variant="outline" size="xs" className="capitalize">
                    {message.category.replace("-", " ")}
                  </Badge>
                )}
                {message.confidenceLevel && (
                  <div className="flex items-center space-x-1">
                    <ApperIcon name="TrendingUp" className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-blue-600">
                      Confidence: {message.confidenceLevel}/5
                    </span>
                  </div>
                )}
              </div>
              
              {/* SBAR Structure Display */}
              {message.sbarStructure && (
                <div className="mb-2 p-2 bg-blue-50 rounded-lg border-l-2 border-blue-200">
                  <div className="text-xs font-medium text-blue-800 mb-1">SBAR Format:</div>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div><span className="font-medium">S:</span> {message.sbarStructure.situation}</div>
                    <div><span className="font-medium">B:</span> {message.sbarStructure.background}</div>
                    <div><span className="font-medium">A:</span> {message.sbarStructure.assessment}</div>
                    <div><span className="font-medium">R:</span> {message.sbarStructure.recommendation}</div>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-700 leading-relaxed">
                {message.message}
              </p>
              
              {/* Evidence Reference Indicator */}
              {message.referencesEvidence && (
                <div className="mt-1 flex items-center space-x-1 text-xs text-green-600">
                  <ApperIcon name="CheckCircle" className="w-3 h-3" />
                  <span>References case evidence</span>
                </div>
              )}
              
              {/* Reflection Type Indicator */}
              {message.reflectionType && (
                <div className="mt-1 text-xs text-purple-600">
                  <ApperIcon name="Brain" className="w-3 h-3 inline mr-1" />
                  Reflection: {message.reflectionType.replace("-", " ")}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
<form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="space-y-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={communicationTemplates[selectedTemplate]?.placeholder || "Share your thoughts on the clinical reasoning process..."}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={selectedTemplate === "message" ? "2" : "4"}
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Discussion Category Selector */}
              <select
                value={discussionCategory}
                onChange={(e) => setDiscussionCategory(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="general">General Discussion</option>
                <option value="evidence-analysis">Evidence Analysis</option>
                <option value="alternative-perspective">Alternative Perspective</option>
                <option value="reflection">Reflection</option>
                <option value="synthesis">Group Synthesis</option>
                <option value="question-inquiry">Question/Inquiry</option>
              </select>
              
              <div className="text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={!newMessage.trim() || loading}
              className="bg-primary text-white px-4 py-2"
            >
              {loading ? (
                <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
              ) : (
                <ApperIcon name="Send" className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default DiscussionPanel;