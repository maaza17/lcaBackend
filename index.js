    const express = require('express')
    const mongoose = require('mongoose')
    const https = require('https')
//    const fs = require('fs')
    require("dotenv").config();

//    var options = {
//        key: fs.readFileSync('./certs/server-key.pem'),
//        cert: fs.readFileSync('./certs/server-cert.pem'),
//    };

    const app = express();

    const homeHeadlineRoute = require('./routes/homeHeadline')
    const homeBannerRoute = require('./routes/homeBanner')
    const testimonialsRoute = require('./routes/testimonials')
    const galleryRoute = require('./routes/gallery')
    const employeeRoute = require('./routes/employee')
    const adminRoute = require('./routes/admin/admin')
    const userRoute = require('./routes/user')
    const courseRoute = require('./routes/course')
    const enrollmentRoute = require('./routes/enrollment')

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

    
    app.use('/api/homeHeadline', homeHeadlineRoute)
    app.use('/api/homeBanner', homeBannerRoute)
    app.use('/api/testimonials', testimonialsRoute)
    app.use('/api/gallery', galleryRoute)
    app.use('/api/employees', employeeRoute)
    app.use('/api/admin', adminRoute)
    app.use('/api/users', userRoute)
    app.use('/api/courses', courseRoute)
    app.use('/api/enrollment', enrollmentRoute)

    
    const port = process.env.PORT || 7001;

//    const server = https.createServer(options, app).listen(port, function(){
//        console.log("Server running on port " + port);
//    });

    app.listen(port,  () => {
        console.log('Server running on port ' + port)
    })
