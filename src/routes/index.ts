import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import medicalRecordRoutes from './medicalRecord.routes';
import treatmentTypeRoutes from './treatmentType.routes';
import priceListRoutes from './priceList.routes';
import appointmentRoutes from './appointment.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/treatment-types', treatmentTypeRoutes);
router.use('/prices', priceListRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/reports', reportRoutes);

export default router;
