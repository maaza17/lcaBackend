    const express = require('express')
    const mongoose = require('mongoose')
    require("dotenv").config();

    const app = express();

    const employeeRoute = require('./routes/employee')
    const adminRoute = require('./routes/admin/admin')
    const userRoute = require('./routes/user')

    app.use(express.urlencoded({ extended: true, limit: 20000000}));
    app.use(express.json());

    app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
    });
    
    mongoose
    .connect(
        process.env.DB_URI,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.log(err));

    app.use('/api/employees', employeeRoute)
    app.use('/api/admin', adminRoute)
    app.use('/api/users', userRoute)

    
    const port = process.env.PORT || 7000;

    app.listen(port,  () => {
        console.log('Server running on port ' + port)

    })