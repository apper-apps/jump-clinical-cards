import groupsData from "@/services/mockData/groups.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate unique IDs
let nextGroupId = 1;
let nextParticipantId = 1;

// Mock current user
const currentUser = {
  id: "current-user",
  name: "Current User",
  role: "student"
};

const groupService = {
  async getAvailableGroups() {
    await delay(300);
    return [...groupsData];
  },

  async createGroup(groupData) {
    await delay(500);
    
    const newGroup = {
      Id: nextGroupId++,
      name: groupData.name,
      caseId: groupData.caseId,
      caseName: "Lower Back Pain Assessment",
      maxParticipants: groupData.maxParticipants || 5,
      facilitatorId: currentUser.id,
      facilitatorName: currentUser.name,
      participants: [{
        Id: nextParticipantId++,
        userId: currentUser.id,
        userName: currentUser.name,
        role: "facilitator",
        joinedAt: new Date().toISOString()
      }],
      status: "waiting",
      currentStage: 1,
      currentPhase: "individual",
      createdAt: new Date().toISOString()
    };

    groupsData.push(newGroup);
    return { ...newGroup };
  },

  async joinGroup(groupId) {
    await delay(400);
    
    const group = groupsData.find(g => g.Id === parseInt(groupId));
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.participants.length >= group.maxParticipants) {
      throw new Error("Group is full");
    }

    if (group.participants.some(p => p.userId === currentUser.id)) {
      throw new Error("Already in this group");
    }

    const participant = {
      Id: nextParticipantId++,
      userId: currentUser.id,
      userName: currentUser.name,
      role: "learner",
      joinedAt: new Date().toISOString()
    };

    group.participants.push(participant);
    
    // Update status based on participants
    if (group.participants.length >= 3) {
      group.status = "active";
    }

    return { ...group };
  },

  async getGroup(groupId) {
    await delay(200);
    const group = groupsData.find(g => g.Id === parseInt(groupId));
    if (!group) {
      throw new Error("Group not found");
    }
    return { ...group };
  },

  async updateGroup(groupId, updates) {
    await delay(300);
    const group = groupsData.find(g => g.Id === parseInt(groupId));
    if (!group) {
      throw new Error("Group not found");
    }

    Object.assign(group, updates);
    return { ...group };
  },

  async leaveGroup(groupId) {
    await delay(300);
    const group = groupsData.find(g => g.Id === parseInt(groupId));
    if (!group) {
      throw new Error("Group not found");
    }

    group.participants = group.participants.filter(p => p.userId !== currentUser.id);
    
    // Update status if needed
    if (group.participants.length < 3) {
      group.status = "waiting";
    }

    return { success: true };
  }
};

export { groupService };