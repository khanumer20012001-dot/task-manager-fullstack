const db = require('../db');

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_STATUSES = ['pending', 'in-progress', 'completed'];

/**
 * Sanitize and validate string inputs
 */
function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

/**
 * GET /api/tasks
 * Fetch tasks with optional search, status, and priority filters
 */
exports.getAllTasks = async (req, res) => {
  try {
    const { search, status, priority, sort = 'newest' } = req.query;

    const conditions = [];
    const values = [];

    if (search && search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(title) LIKE $${values.length} OR LOWER(description) LIKE $${values.length})`);
    }

    if (status && VALID_STATUSES.includes(status)) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (priority && VALID_PRIORITIES.includes(priority)) {
      values.push(priority);
      conditions.push(`priority = $${values.length}`);
    }

    let whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY created_at DESC';
    if (sort === 'oldest') orderBy = 'ORDER BY created_at ASC';
    if (sort === 'title') orderBy = 'ORDER BY LOWER(title) ASC';
    if (sort === 'priority') {
      orderBy = `ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END ASC`;
    }

    const queryText = `SELECT id, title, description, priority, status, created_at, updated_at FROM tasks ${whereClause} ${orderBy}`;
    const result = await db.query(queryText, values);

    // Compute live stats for dashboard counters
    const statsQuery = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END)::int AS in_progress,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending,
        COUNT(CASE WHEN priority = 'high' THEN 1 END)::int AS high_priority
      FROM tasks
    `;
    const statsResult = await db.query(statsQuery);

    return res.status(200).json({
      success: true,
      tasks: result.rows,
      stats: statsResult.rows[0] || {
        total: 0,
        completed: 0,
        in_progress: 0,
        pending: 0,
        high_priority: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching tasks',
      error: error.message,
    });
  }
};

/**
 * GET /api/tasks/:id
 * Fetch single task by ID
 */
exports.getTaskById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid task ID provided' });
    }

    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/tasks
 * Create a new task with input validation and parameterized query
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description = '', priority = 'medium', status = 'pending' } = req.body;

    const sanitizedTitle = sanitizeString(title, 255);
    const sanitizedDescription = sanitizeString(description, 5000);

    // Validation
    if (!sanitizedTitle) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required and cannot be empty',
      });
    }

    const validatedPriority = VALID_PRIORITIES.includes(priority) ? priority : 'medium';
    const validatedStatus = VALID_STATUSES.includes(status) ? status : 'pending';

    const insertQuery = `
      INSERT INTO tasks (title, description, priority, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      sanitizedTitle,
      sanitizedDescription,
      validatedPriority,
      validatedStatus,
    ]);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating task',
      error: error.message,
    });
  }
};

/**
 * PUT /api/tasks/:id
 * Update an existing task or toggle completion status
 */
exports.updateTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid task ID provided' });
    }

    // Check if task exists
    const checkResult = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const currentTask = checkResult.rows[0];
    const { title, description, priority, status } = req.body;

    // Handle toggle shortcuts or partial updates
    let updatedTitle = title !== undefined ? sanitizeString(title, 255) : currentTask.title;
    if (title !== undefined && !updatedTitle) {
      return res.status(400).json({ success: false, message: 'Task title cannot be empty' });
    }

    let updatedDescription = description !== undefined ? sanitizeString(description, 5000) : currentTask.description;
    
    let updatedPriority = priority !== undefined
      ? (VALID_PRIORITIES.includes(priority) ? priority : currentTask.priority)
      : currentTask.priority;

    let updatedStatus = status !== undefined
      ? (VALID_STATUSES.includes(status) ? status : currentTask.status)
      : currentTask.status;

    // Support boolean completed toggle if passed: e.g. { completed: true }
    if (req.body.completed !== undefined) {
      updatedStatus = req.body.completed ? 'completed' : 'pending';
    }

    const updateQuery = `
      UPDATE tasks
      SET title = $1, description = $2, priority = $3, status = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      updatedTitle,
      updatedDescription,
      updatedPriority,
      updatedStatus,
      id,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating task',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/tasks/:id
 * Remove a specific task by ID
 */
exports.deleteTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid task ID provided' });
    }

    const deleteQuery = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
    const result = await db.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      deletedTask: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting task',
      error: error.message,
    });
  }
};
