
export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE'
};

export const TASK_STATUSES = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

export const PROJECT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD'
};

export const TEAM_ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER'
};

export const PRIORITY_COLORS = {
  LOW: '#059669',
  MEDIUM: '#D97706', 
  HIGH: '#EA580C',
  URGENT: '#DC2626'
};

export const STATUS_COLORS = {
  TODO: '#6B7280',
  IN_PROGRESS: '#2563EB',
  DONE: '#059669',
  ACTIVE: '#2563EB',
  COMPLETED: '#059669',
  ON_HOLD: '#6B7280'
};

export const KANBAN_COLUMNS = [
  { id: 'TODO', title: 'To Do', status: 'TODO' },
  { id: 'IN_PROGRESS', title: 'In Progress', status: 'IN_PROGRESS' },
  { id: 'DONE', title: 'Done', status: 'DONE' }
];
