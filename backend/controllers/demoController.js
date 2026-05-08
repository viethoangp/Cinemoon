import { getConnection, getOracle } from '../config/db.js';
import { buildResponse } from '../utils/responseBuilder.js';

/**
 * Demo 1: Demonstrate ORA-00054 by holding a seat then trying to lock it again
 * Shows how SELECT FOR UPDATE NOWAIT fails when resource is already locked
 * GET /api/demo/ora-00054-demo
 */
export async function demonstrateORA00054(req, res) {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = getOracle();

    const masuat = 'SC001';
    const maghe = 'GHE001';
    const maphong = 'PC001';

    console.log('[DEMO] Step 1: First user locks the seat...');
    // First user locks the seat
    const lockQuery1 = `
      SELECT MAGHE FROM GHE_NGOI 
      WHERE MAGHE = :maghe AND MAPHONG = :maphong 
      FOR UPDATE NOWAIT
    `;

    const lockResult1 = await connection.execute(lockQuery1, {
      maghe,
      maphong,
    });
    console.log('[DEMO] ✓ First lock acquired successfully');

    // Simulate delay (first user thinking...)
    console.log('[DEMO] Step 2: Simulating 2-second hold time...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Try to lock again within same transaction (should fail)
    console.log('[DEMO] Step 3: Second user tries SELECT FOR UPDATE NOWAIT...');
    try {
      const lockQuery2 = `
        SELECT MAGHE FROM GHE_NGOI 
        WHERE MAGHE = :maghe AND MAPHONG = :maphong 
        FOR UPDATE NOWAIT
      `;

      const lockResult2 = await connection.execute(lockQuery2, {
        maghe,
        maphong,
      });
      console.log('[DEMO] ✗ Unexpected: Second lock succeeded (should fail)');

      return res.status(200).json(
        buildResponse(true, 'Demo: Locks acquired but no conflict (concurrent lock not tested)', {
          scenario: 'ORA-00054 demo',
          result: 'Lock acquisition successful (need separate connections for true concurrency)',
          lockResult1: 'Success',
          lockResult2: 'Success',
        })
      );
    } catch (lockError) {
      if (lockError.errorNum === 54 || lockError.message.includes('ORA-00054')) {
        console.log('[DEMO] ✓ ORA-00054 caught: Resource busy!');
        return res.status(200).json(
          buildResponse(true, 'ORA-00054 Demonstration Successful', {
            scenario: 'SELECT FOR UPDATE NOWAIT conflict',
            errorCode: 'ORA-00054',
            errorMessage: 'Resource busy - lock timeout',
            firstLock: 'Acquired successfully',
            secondLock: 'Failed with ORA-00054',
            explanation:
              'When two users try to lock the same row simultaneously, the second one gets ORA-00054.',
          })
        );
      }
      throw lockError;
    }
  } catch (error) {
    console.error('[DEMO] Error:', error.message);
    res.status(500).json(
      buildResponse(false, `Demo error: ${error.message}`, {
        errorNum: error.errorNum,
        errorMessage: error.message,
      })
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('[DEMO] Close error:', closeErr);
      }
    }
  }
}

/**
 * Demo 2: Concurrent booking simulation
 * Shows what happens when multiple users book the same seat
 * GET /api/demo/concurrent-booking?seatIds=GHE001,GHE002&concurrentUsers=3
 */
export async function demonstrateConcurrentBooking(req, res) {
  const { seatIds = 'GHE001', concurrentUsers = 2 } = req.query;
  const seats = seatIds.split(',');
  const numUsers = Math.min(parseInt(concurrentUsers), 10); // Max 10 concurrent

  console.log(`[DEMO] Simulating ${numUsers} concurrent bookings for seats: ${seats.join(',')}`);

  const results = [];

  // Simulate concurrent booking attempts
  const promises = [];
  for (let i = 0; i < numUsers; i++) {
    const promise = simulateUserBooking(i + 1, seats, results);
    promises.push(promise);
  }

  try {
    await Promise.all(promises);

    const successCount = results.filter((r) => r.success).length;
    const conflictCount = results.filter((r) => r.errorCode === 'ORA-00054').length;
    const failureCount = results.filter((r) => !r.success && r.errorCode !== 'ORA-00054')
      .length;

    res.status(200).json(
      buildResponse(true, 'Concurrent booking simulation complete', {
        totalUsers: numUsers,
        totalSeats: seats.length,
        results: {
          successful: successCount,
          oraConflicts: conflictCount,
          otherFailures: failureCount,
        },
        details: results,
        summary: `${successCount} users booked successfully, ${conflictCount} got ORA-00054 conflicts`,
      })
    );
  } catch (error) {
    console.error('[DEMO] Concurrent booking error:', error);
    res.status(500).json(buildResponse(false, error.message, results));
  }
}

/**
 * Simulate a single user's booking attempt
 * @private
 */
async function simulateUserBooking(userId, seats, results) {
  let connection;
  try {
    connection = await getConnection();
    const masuat = 'SC001';
    const maphong = 'PC001';

    console.log(`[USER ${userId}] Attempting to book ${seats.length} seats...`);

    // Try to lock all seats
    const seatIdList = seats.map((_, i) => `:seat${i}`).join(',');
    const params = { maphong };
    seats.forEach((id, i) => {
      params[`seat${i}`] = id;
    });

    const lockQuery = `
      SELECT MAGHE FROM GHE_NGOI 
      WHERE MAGHE IN (${seatIdList}) AND MAPHONG = :maphong 
      FOR UPDATE NOWAIT
    `;

    try {
      const lockResult = await connection.execute(lockQuery, params);

      if (lockResult.rows && lockResult.rows.length === seats.length) {
        // Successfully locked all seats
        await connection.commit();
        console.log(`[USER ${userId}] ✓ Booking successful!`);

        results.push({
          userId,
          success: true,
          message: `User ${userId} booked ${seats.length} seats`,
          seatsBooked: seats,
        });
      } else {
        console.log(`[USER ${userId}] ✗ Not all seats available`);
        results.push({
          userId,
          success: false,
          errorCode: 'PARTIAL_LOCK',
          message: `User ${userId} could not book all seats`,
        });
      }
    } catch (lockError) {
      if (lockError.errorNum === 54 || lockError.message.includes('ORA-00054')) {
        console.log(`[USER ${userId}] ✗ ORA-00054: Resource busy!`);
        results.push({
          userId,
          success: false,
          errorCode: 'ORA-00054',
          message: `User ${userId} encountered ORA-00054 (seat conflict)`,
        });
      } else {
        throw lockError;
      }
    }
  } catch (error) {
    console.error(`[USER ${userId}] Error:`, error.message);
    results.push({
      userId,
      success: false,
      errorCode: 'ERROR',
      message: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error(`[USER ${userId}] Close error:`, closeErr);
      }
    }
  }
}

/**
 * Demo 3: Show database locks in real-time
 * GET /api/demo/active-locks
 */
export async function viewActiveLocks(req, res) {
  let connection;
  try {
    connection = await getConnection();

    // Query V$LOCK view (requires DBA privileges)
    const locksQuery = `
      SELECT
        s.SID,
        s.USERNAME,
        l.TYPE,
        l.LMODE,
        l.REQUEST,
        t.NAME as OBJECT_NAME
      FROM v$lock l
      LEFT JOIN v$session s ON l.SID = s.SID
      LEFT JOIN dba_objects t ON l.ID1 = t.OBJECT_ID
      WHERE s.USERNAME IS NOT NULL
        AND s.USERNAME != 'SYS'
      ORDER BY s.SID
    `;

    try {
      const result = await connection.execute(locksQuery);
      res.status(200).json(
        buildResponse(true, 'Active database locks', {
          lockCount: result.rows ? result.rows.length : 0,
          locks: result.rows || [],
        })
      );
    } catch (err) {
      // v$lock might require elevated privileges
      res.status(403).json(
        buildResponse(
          false,
          'Cannot view active locks (requires DBA privileges or proper role)',
          { suggestion: 'This endpoint requires SELECT on V$LOCK and V$SESSION' }
        )
      );
    }
  } catch (error) {
    console.error('[DEMO] Lock viewing error:', error);
    res.status(500).json(buildResponse(false, error.message, {}));
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('[DEMO] Close error:', closeErr);
      }
    }
  }
}

/**
 * Demo 4: Stress test - rapid concurrent bookings
 * POST /api/demo/stress-test
 * Body: { iterations: 10, concurrentPerIteration: 5 }
 */
export async function stressTest(req, res) {
  const { iterations = 5, concurrentPerIteration = 3 } = req.body;

  console.log(
    `[DEMO STRESS] Starting stress test: ${iterations} iterations, ${concurrentPerIteration} concurrent per iteration`
  );

  const stressResults = {
    totalAttempts: 0,
    successful: 0,
    conflicts: 0,
    failures: 0,
    iterations: [],
  };

  try {
    for (let iter = 1; iter <= iterations; iter++) {
      console.log(`[DEMO STRESS] Iteration ${iter}/${iterations}`);

      const seatRotation = ['GHE001', 'GHE002', 'GHE003'];
      const iterationResults = [];
      const promises = [];

      for (let i = 0; i < concurrentPerIteration; i++) {
        const seatIndex = (iter + i) % seatRotation.length;
        const seats = [seatRotation[seatIndex]];
        const promise = simulateUserBooking(
          `Iter${iter}_User${i}`,
          seats,
          iterationResults
        );
        promises.push(promise);
      }

      await Promise.all(promises);

      const iterSuccess = iterationResults.filter((r) => r.success).length;
      const iterConflicts = iterationResults.filter((r) => r.errorCode === 'ORA-00054')
        .length;

      stressResults.totalAttempts += concurrentPerIteration;
      stressResults.successful += iterSuccess;
      stressResults.conflicts += iterConflicts;
      stressResults.failures += concurrentPerIteration - iterSuccess;

      stressResults.iterations.push({
        iteration: iter,
        attempts: concurrentPerIteration,
        successful: iterSuccess,
        conflicts: iterConflicts,
      });

      // Small delay between iterations
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const conflictRate = (
      ((stressResults.conflicts / stressResults.totalAttempts) * 100).toFixed(2)
    );

    res.status(200).json(
      buildResponse(true, 'Stress test completed', {
        summary: {
          totalAttempts: stressResults.totalAttempts,
          successful: stressResults.successful,
          oraConflicts: stressResults.conflicts,
          otherFailures: stressResults.failures,
          conflictRate: `${conflictRate}%`,
        },
        details: stressResults.iterations,
      })
    );
  } catch (error) {
    console.error('[DEMO STRESS] Error:', error);
    res.status(500).json(buildResponse(false, error.message, stressResults));
  }
}

/**
 * Demo 5: Info - Get demo information
 * GET /api/demo/info
 */
export async function getDemoInfo(req, res) {
  res.status(200).json(
    buildResponse(true, 'Demo endpoints information', {
      endpoints: [
        {
          path: '/demo/ora-00054-demo',
          method: 'GET',
          description:
            'Demonstrates ORA-00054 error with SELECT FOR UPDATE NOWAIT',
          usage: 'curl http://localhost:3000/api/demo/ora-00054-demo',
        },
        {
          path: '/demo/concurrent-booking',
          method: 'GET',
          description: 'Simulates concurrent bookings on the same seats',
          parameters: {
            seatIds: 'Comma-separated seat IDs (default: GHE001)',
            concurrentUsers: 'Number of concurrent users (default: 2, max: 10)',
          },
          usage: 'curl "http://localhost:3000/api/demo/concurrent-booking?seatIds=GHE001,GHE002&concurrentUsers=3"',
        },
        {
          path: '/demo/stress-test',
          method: 'POST',
          description: 'Run rapid concurrent booking stress test',
          body: {
            iterations: 'Number of test iterations (default: 5)',
            concurrentPerIteration: 'Concurrent bookings per iteration (default: 3)',
          },
          usage:
            'curl -X POST http://localhost:3000/api/demo/stress-test -H "Content-Type: application/json" -d \'{"iterations":10,"concurrentPerIteration":5}\'',
        },
        {
          path: '/demo/active-locks',
          method: 'GET',
          description: 'View active database locks (requires DBA privileges)',
          usage: 'curl http://localhost:3000/api/demo/active-locks',
        },
        {
          path: '/demo/info',
          method: 'GET',
          description: 'Get this information',
          usage: 'curl http://localhost:3000/api/demo/info',
        },
      ],
      oraErrorExplanation: {
        code: 'ORA-00054',
        name: 'Resource busy',
        cause:
          'When two or more users try to lock the same database row simultaneously with SELECT FOR UPDATE NOWAIT',
        prevention:
          'Implement retry logic with exponential backoff or use optimistic locking instead',
        cinemoonExample:
          'When User A and User B both try to book seat GHE001 at the same time, User B gets ORA-00054',
      },
    })
  );
}
