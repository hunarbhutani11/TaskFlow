/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'ADMIN'|'MEMBER'} role
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {User} createdBy
 * @property {User[]} members
 * @property {number} totalTasks
 * @property {number} doneTasks
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {'TODO'|'IN_PROGRESS'|'DONE'} status
 * @property {'LOW'|'MEDIUM'|'HIGH'} priority
 * @property {string} [dueDate]
 * @property {User} [assignedTo]
 * @property {User} createdBy
 * @property {{id: string, name: string}} project
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
