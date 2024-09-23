const express = require('express');
const router = express.Router();
const appointmentController = require('../controller/appointmentController');
const { middleware } = require('../middleware/jwtmiddleware');

router.post('/appointment', middleware, appointmentController.createAppointment);
router.get('/appointment', middleware, appointmentController.getAppointments);
router.get('/appointment/:id', middleware, appointmentController.getAppointmentById);
router.put('/appointment/:id', middleware, appointmentController.updateAppointment);
router.delete('/appointment/:id', middleware, appointmentController.deleteAppointment);

module.exports = router;
