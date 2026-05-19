const Task = require('../models/Task');

const VALID_STATUSES = ['pending', 'in_progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_SORT_FIELDS = ['createdAt', 'dueDate', 'priority'];

const validateTaskBody = (body, requireTitle = false) => {
  const errors = [];
  const { title, status, priority, dueDate, description } = body;

  if (requireTitle && !title) {
    errors.push({ field: 'title', message: 'title is required' });
  }
  if (title !== undefined && title.trim().length === 0) {
    errors.push({ field: 'title', message: 'title cannot be empty' });
  }
  if (title !== undefined && title.length > 100) {
    errors.push({ field: 'title', message: 'title must be 100 characters or less' });
  }
  if (description !== undefined && description.length > 500) {
    errors.push({ field: 'description', message: 'description must be 500 characters or less' });
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push({ field: 'status', message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push({ field: 'priority', message: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }
  if (dueDate !== undefined && isNaN(Date.parse(dueDate))) {
    errors.push({ field: 'dueDate', message: 'dueDate must be a valid ISO 8601 date' });
  }

  return errors;
};

const list = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 10), 100);

    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortField = VALID_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum) || 1;

    res.json({
      data: tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages,
        hasNext: pageNum < pages,
        hasPrev: pageNum > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const errors = validateTaskBody(req.body, true);
    if (errors.length) {
      return res.status(422).json({
        error: 'ValidationError',
        message: 'Request validation failed',
        details: { errors }
      });
    }

    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      userId: req.user._id
    });

    res.status(201).json({ data: task });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'NotFound', message: 'Task not found' });
    }
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
};

const replace = async (req, res, next) => {
  try {
    const errors = validateTaskBody(req.body, true);
    if (errors.length) {
      return res.status(422).json({
        error: 'ValidationError',
        message: 'Request validation failed',
        details: { errors }
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'NotFound', message: 'Task not found' });
    }
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    const { title, description, status, priority, dueDate } = req.body;
    task.title = title;
    task.description = description;
    task.status = status || 'pending';
    task.priority = priority || 'medium';
    task.dueDate = dueDate;
    await task.save();

    res.json({ data: task });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const errors = validateTaskBody(req.body, false);
    if (errors.length) {
      return res.status(422).json({
        error: 'ValidationError',
        message: 'Request validation failed',
        details: { errors }
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'NotFound', message: 'Task not found' });
    }
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    const { title, description, status, priority, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    await task.save();

    res.json({ data: task });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'NotFound', message: 'Task not found' });
    }
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }
    await task.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, getById, replace, update, remove };
