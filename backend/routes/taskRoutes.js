const express = require("express");
const {
  createTask,
  deleteTask,
  getTasks,
  toggleTaskStatus,
  updateTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.patch("/:id/toggle", toggleTaskStatus);
router.delete("/:id", deleteTask);

module.exports = router;
