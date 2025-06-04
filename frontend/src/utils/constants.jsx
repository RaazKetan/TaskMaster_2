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
  LOW: 'priority-low',
  MEDIUM: 'priority-medium',
  HIGH: 'priority-high',
  URGENT: 'priority-urgent'
};

export const STATUS_COLORS = {
  TODO: 'status-todo',
  IN_PROGRESS: 'status-in-progress',
  DONE: 'status-done',
  ACTIVE: 'status-in-progress',
  COMPLETED: 'status-done',
  ON_HOLD: 'status-todo'
};

export const KANBAN_COLUMNS = [
  { id: 'TODO', title: 'To Do', status: 'TODO' },
  { id: 'IN_PROGRESS', title: 'In Progress', status: 'IN_PROGRESS' },
  { id: 'DONE', title: 'Done', status: 'DONE' }
];
