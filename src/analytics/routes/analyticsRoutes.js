import express from 'express';
import {
  trackEvents,
  getStats,
  getSessions,
  getSessionDetail,
  deleteAllAnalytics,
  deleteAnalyticsByPeriod,
  deleteSession,
  getAnalyticsInfo,
} from '../controllers/analyticsController.js';
import { requireAdminJwt } from '../../admin/middleware/adminJwtAuth.js';

const router = express.Router();

router.post('/', trackEvents);

router.use(requireAdminJwt);

router.get('/info', getAnalyticsInfo);
router.get('/stats', getStats);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId', getSessionDetail);

router.delete('/data/all', deleteAllAnalytics);
router.delete('/data/period', deleteAnalyticsByPeriod);
router.delete('/sessions/:sessionId', deleteSession);

export default router;
