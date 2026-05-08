import express from 'express';
import {
  demonstrateORA00054,
  demonstrateConcurrentBooking,
  viewActiveLocks,
  stressTest,
  getDemoInfo,
} from '../controllers/demoController.js';

const router = express.Router();

/**
 * Demo Routes - For testing and demonstrating ORA-00054 concurrency scenarios
 * These are PUBLIC endpoints (no authentication required) for demonstration purposes
 */

/**
 * GET /api/demo/info
 * Information about available demo endpoints
 */
router.get('/info', getDemoInfo);

/**
 * GET /api/demo/ora-00054-demo
 * Demonstrate ORA-00054 error with SELECT FOR UPDATE NOWAIT
 * Shows how concurrent lock attempts fail
 */
router.get('/ora-00054-demo', demonstrateORA00054);

/**
 * GET /api/demo/concurrent-booking
 * Simulate concurrent booking attempts
 * Query parameters:
 *  - seatIds: Comma-separated seat IDs (default: GHE001)
 *  - concurrentUsers: Number of concurrent users (default: 2, max: 10)
 */
router.get('/concurrent-booking', demonstrateConcurrentBooking);

/**
 * GET /api/demo/active-locks
 * View active database locks
 * Requires DBA privileges to access V$LOCK and V$SESSION views
 */
router.get('/active-locks', viewActiveLocks);

/**
 * POST /api/demo/stress-test
 * Run rapid concurrent booking stress test
 * Body: { iterations: number, concurrentPerIteration: number }
 */
router.post('/stress-test', stressTest);

export default router;
