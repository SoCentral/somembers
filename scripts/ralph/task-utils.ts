/**
 * Ralph Task Management Utilities
 *
 * Helper functions to manage tasks stored in tasks.json
 * Used by Ralph for autonomous task execution
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const TASKS_FILE = join(__dirname, 'tasks.json');

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  dependsOn: string[];
  parentId: string;
}

interface TasksData {
  repoURL: string;
  parentTask: {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
  };
  tasks: Task[];
}

function loadTasks(): TasksData {
  const content = readFileSync(TASKS_FILE, 'utf-8');
  return JSON.parse(content);
}

function saveTasks(data: TasksData): void {
  writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Get all tasks that are ready to work on
 * A task is ready if: status is 'open' AND all dependencies are 'completed'
 */
export function getReadyTasks(): Task[] {
  const data = loadTasks();
  const completedIds = new Set(
    data.tasks.filter(t => t.status === 'completed').map(t => t.id)
  );

  return data.tasks.filter(task => {
    if (task.status !== 'open') return false;
    return task.dependsOn.every(depId => completedIds.has(depId));
  });
}

/**
 * Get a task by ID
 */
export function getTask(taskId: string): Task | undefined {
  const data = loadTasks();
  return data.tasks.find(t => t.id === taskId);
}

/**
 * Update task status
 */
export function updateTaskStatus(taskId: string, status: Task['status']): void {
  const data = loadTasks();
  const task = data.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    saveTasks(data);
  }
}

/**
 * Get all tasks with their status
 */
export function getAllTasks(): Task[] {
  const data = loadTasks();
  return data.tasks;
}

/**
 * Check if all tasks are completed
 */
export function isAllComplete(): boolean {
  const data = loadTasks();
  return data.tasks.every(t => t.status === 'completed');
}

/**
 * Get task statistics
 */
export function getStats(): { total: number; completed: number; ready: number; blocked: number } {
  const data = loadTasks();
  const completedIds = new Set(
    data.tasks.filter(t => t.status === 'completed').map(t => t.id)
  );

  const completed = data.tasks.filter(t => t.status === 'completed').length;
  const ready = data.tasks.filter(t =>
    t.status === 'open' && t.dependsOn.every(d => completedIds.has(d))
  ).length;
  const blocked = data.tasks.filter(t =>
    t.status === 'open' && !t.dependsOn.every(d => completedIds.has(d))
  ).length;

  return {
    total: data.tasks.length,
    completed,
    ready,
    blocked
  };
}

// CLI interface for Ralph to call
if (require.main === module) {
  const [,, command, ...args] = process.argv;

  switch (command) {
    case 'ready':
      console.log(JSON.stringify(getReadyTasks(), null, 2));
      break;
    case 'get':
      console.log(JSON.stringify(getTask(args[0]), null, 2));
      break;
    case 'complete':
      updateTaskStatus(args[0], 'completed');
      console.log(`Task ${args[0]} marked as completed`);
      break;
    case 'start':
      updateTaskStatus(args[0], 'in_progress');
      console.log(`Task ${args[0]} marked as in_progress`);
      break;
    case 'stats':
      console.log(JSON.stringify(getStats(), null, 2));
      break;
    case 'list':
      console.log(JSON.stringify(getAllTasks(), null, 2));
      break;
    default:
      console.log('Usage: task-utils.ts <ready|get|complete|start|stats|list> [taskId]');
  }
}
