const Task = require("../models/Task");

const allowedStatuses = ["pending", "completed"];

const getTasks = async (req, res) => {
  try {
    const { search = "", status = "all", page = 1, limit = 6 } = req.query;
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 6, 1), 50);
    const filters = { userId: req.user._id };

    if (status !== "all") {
      filters.status = status;
    }

    if (search.trim()) {
      filters.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [tasks, total] = await Promise.all([
      Task.find(filters)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),
      Task.countDocuments(filters),
    ]);

    res.json({
      tasks,
      total,
      page: currentPage,
      pages: Math.max(Math.ceil(total / pageSize), 1),
    });
  } catch (error) {
    console.error("Get tasks error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description = "", status = "pending" } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid task status" });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      status,
      userId: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description = "", status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "Task title is required" });
      }

      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid task status" });
      }

      task.status = status;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = task.status === "completed" ? "pending" : "completed";

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error("Toggle task error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
};
