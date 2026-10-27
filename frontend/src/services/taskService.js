// One small function per task endpoint (see API_REFERENCE.md).
import { request } from './api.js';

// GET /api/tasks?search=&status=&priority=  (empty filters are left out)
export function getTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);

  const query = params.toString();
  return request(query ? `/api/tasks?${query}` : '/api/tasks');
}

// GET /api/tasks/{id}
export function getTask(id) {
  return request(`/api/tasks/${id}`);
}

// POST /api/tasks
export function createTask(task) {
  return request('/api/tasks', { method: 'POST', body: task });
}

// PUT /api/tasks/{id}
export function updateTask(id, task) {
  return request(`/api/tasks/${id}`, { method: 'PUT', body: task });
}

// PATCH /api/tasks/{id}/status
export function updateTaskStatus(id, status) {
  return request(`/api/tasks/${id}/status`, { method: 'PATCH', body: { status } });
}

// DELETE /api/tasks/{id}  (backend returns 204 No Content)
export function deleteTask(id) {
  return request(`/api/tasks/${id}`, { method: 'DELETE' });
}

// GET /api/tasks/summary -> counts + recent tasks for the dashboard
export function getSummary() {
  return request('/api/tasks/summary');
}
