const router = require("express").Router();
const mongoose = require("mongoose");
const adminModel = require("../../models/admin/Admin");
const userModel = require("../../models/User");
const courseModel = require("../../models/Course");
const bookModel = require("../../models/Books");
const trainingModel = require("../../models/Trainings");
const verifyAdminToken = require("../../helpers/verifyAdminToken");
const jwt = require("jsonwebtoken");
const booksModel = require("../../models/Books");

router.post("/getCounts", (req, res) => {
  if (!req.body.token) {
    return res.status(200).json({
      error: true,
      message: "Admin token is required to proceed.",
    });
  }

  verifyAdminToken(req.body.token, async (item) => {
    const isAdmin = item.isAdmin;
    const id = item.id;
    const name = item.name;
    if (!isAdmin) {
      return res.status(200).json({
        error: true,
        message: "Access denied. Limited for admin(s).",
      });
    } else {
      let coursesCount,
        booksCount,
        usersCount,
        trainingsCount = 0;
      usersCount = await userModel.countDocuments({ _id: { $exists: true } });
      coursesCount = await courseModel.countDocuments({
        _id: { $exists: true },
      });
      booksCount = await booksModel.countDocuments({ _id: { $exists: true } });
      trainingsCount = await trainingModel.countDocuments({
        _id: { $exists: true },
      });

      return res.status(200).json({
        error: false,
        message: "Counts found.",
        data: { coursesCount, booksCount, usersCount, trainingsCount },
      });
    }
  });
});
router.post("/getUserCountsByStatus", async (req, res) => {
  if (!req.body.token) {
    return res.status(401).json({
      error: true,
      message: "Admin token is required to proceed.",
    });
  }

  verifyAdminToken(req.body.token, async (item) => {
    const isAdmin = item.isAdmin;
    const id = item.id;
    const name = item.name;
    if (!isAdmin) {
      return res.status(200).json({
        error: true,
        message: "Access denied. Limited for admin(s).",
      });
    } else {
      const userCountByStatus = await userModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      return res.status(200).json({
        error: false,
        message: "Counts found.",
        data: userCountByStatus,
      });
    }
  });
});
router.post("/getCourseCountsByType", async (req, res) => {
  if (!req.body.token) {
    return res.status(401).json({
      error: true,
      message: "Admin token is required to proceed.",
    });
  }

  verifyAdminToken(req.body.token, async (item) => {
    const isAdmin = item.isAdmin;
    const id = item.id;
    const name = item.name;
    if (!isAdmin) {
      return res.status(200).json({
        error: true,
        message: "Access denied. Limited for admin(s).",
      });
    } else {
      const courseCountByType = await courseModel.aggregate([
        {
          $group: {
            _id: "$courseType",
            count: { $sum: 1 },
          },
        },
      ]);
      return res.status(200).json({
        error: false,
        message: "Counts found.",
        data: courseCountByType,
      });
    }
  });
});

router.post("/getTrainingCountsByEventType", async (req, res) => {
  if (!req.body.token) {
    return res.status(401).json({
      error: true,
      message: "Admin token is required to proceed.",
    });
  }

  verifyAdminToken(req.body.token, async (item) => {
    const isAdmin = item.isAdmin;
    const id = item.id;
    const name = item.name;
    if (!isAdmin) {
      return res.status(200).json({
        error: true,
        message: "Access denied. Limited for admin(s).",
      });
    } else {
      const trainingCountByEventType = await trainingModel.aggregate([
        {
          $group: {
            _id: "$eventType",
            count: { $sum: 1 },
          },
        },
      ]);
      return res.status(200).json({
        error: false,
        message: "Counts found.",
        data: trainingCountByEventType,
      });
    }
  });
});

router.post("/getTrainingCountsByMonth", async (req, res) => {
  if (!req.body.token) {
    return res.status(401).json({
      error: true,
      message: "Admin token is required to proceed.",
    });
  }

  verifyAdminToken(req.body.token, async (item) => {
    const isAdmin = item.isAdmin;
    const id = item.id;
    const name = item.name;
    if (!isAdmin) {
      return res.status(200).json({
        error: true,
        message: "Access denied. Limited for admin(s).",
      });
    } else {
      const trainingCountByMonth = await trainingModel.aggregate([
        {$group: { _id: { year: { $year: "$startDate" }, month: { $month: "$startDate" } },
        total_count_month: { $sum: 1 }}}])

      return res.status(200).json({
        error: false,
        message: "Counts found.",
        data: trainingCountByMonth,
      });
    }
  });
});
module.exports = router;
