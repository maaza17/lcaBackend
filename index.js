const express = require('express')
const mongoose = require('mongoose')
require("dotenv").config();

const app = express();
var cors = require('cors');
app.use(cors());

const verifyGlobalToken = require('./routes/global')
const homeHeadlineRoute = require('./routes/homeHeadline')
const homeBannerRoute = require('./routes/homeBanner')
const testimonialsRoute = require('./routes/testimonials')
const galleryRoute = require('./routes/gallery')
const employeeRoute = require('./routes/employee')
const adminRoute = require('./routes/admin/admin')
const adminDashBoardRoute = require('./routes/admin/adminDashboard')
const userRoute = require('./routes/user')
const courseRoute = require('./routes/course')
const enrollmentRoute = require('./routes/enrollment')
const updatesRoute = require('./routes/updates')
const booksRoute = require('./routes/books')
const trainingRoute = require('./routes/trainings')

app.use(express.urlencoded({ extended: true, limit: 20000000 }));
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


app.use('/api/global', verifyGlobalToken)
app.use('/api/homeHeadline', homeHeadlineRoute)
app.use('/api/homeBanner', homeBannerRoute)
app.use('/api/testimonials', testimonialsRoute)
app.use('/api/gallery', galleryRoute)
app.use('/api/employees', employeeRoute)
app.use('/api/admin', adminRoute)
app.use('/api/adminDashboard', adminDashBoardRoute)
app.use('/api/users', userRoute)
app.use('/api/courses', courseRoute)
app.use('/api/enrollment', enrollmentRoute)
app.use('/api/updates', updatesRoute)
app.use('/api/books', booksRoute)
app.use('/api/trainings', trainingRoute)


const port = process.env.PORT || 7000;

app.listen(port, () => {
    console.log('Server running on port ' + port)
})