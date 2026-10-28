export type SystemRole = 'STUDENT' | 'LECTURER' | 'ADMIN';
export type ProjectRole = 'LEADER' | 'MEMBER' | 'ADVISOR';
export type ProjectTemplate = 'CAPSTONE_9W' | 'COURSE_15W' | 'SCRUM_BASIC';

export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type IssuePriority = 'LOWEST' | 'LOW' | 'MEDIUM' | 'HIGH' | 'HIGHEST';
export type IssueType = 'STORY' | 'TASK' | 'BUG' | 'REPORT';
export type MilestoneStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'CHANGES_REQUESTED';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  studentCode?: string | null;
  systemRole: SystemRole;
  projectRole: ProjectRole;
}

export interface ProjectMemberItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  studentCode?: string | null;
  systemRole: SystemRole;
  role: ProjectRole;
  joinedAt: string;
}

export interface EpicItem {
  id: string;
  title: string;
  description?: string;
  color: string;
  startDate?: string;
  dueDate?: string;
}

export interface ProjectWorkspace {
  id: string;
  key: string;
  name: string;
  description: string;
  semester: string;
  templateType: ProjectTemplate;
  advisorName: string;
  currentSprintName: string;
  issueCounter: number;
  members: ProjectMemberItem[];
  epics: EpicItem[];
  issues: IssueItem[];
  milestones: MilestoneItem[];
}

export interface IssueItem {
  id: string;
  issueKey: string;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  storyPoints: number;
  position: number;
  assigneeName: string;
  studentCode: string;
  epicId?: string | null;
  inBacklog?: boolean; // true = nằm trong Product Backlog, false/undefined = nằm trong Active Sprint
  dueDate?: string;
}

export interface MilestoneItem {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  submissionUrl?: string;
  submissionNote?: string;
  advisorFeedback?: string;
  advisorGrade?: number;
}

export interface MemberContribution {
  userId: string;
  fullName: string;
  studentCode: string;
  role: 'LEADER' | 'MEMBER';
  totalAssignedIssues: number;
  completedIssues: number;
  completedStoryPoints: number;
  onTimeRate: number;
  peerReviewAvgOn5: number;
  finalContributionScore: number;
  workloadPercentage: number;
  isFreeRiderWarning: boolean;
  suggestedGradeFactor: number;
}
