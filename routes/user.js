const router = require('express').Router()
const mongoose = require('mongoose')
const adminModel = require('../../models/admin/Admin')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const verifyToken = require('../helpers/verifyToken')

module.exports = router