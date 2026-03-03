import db from "../../config/db.js";

export const getReportsData = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        console.log('📊 Reports API called with:', { startDate, endDate });
        
        // Fetch all reports data in parallel
        console.log('1️⃣ Starting to fetch reports...');
        
        const [
            appointmentsData,
            usersData,
            petsData,
            visitsData,
            feedbacksData,
            lostPetsData
        ] = await Promise.all([
            getAppointmentsReport(startDate, endDate),
            getUsersReport(startDate, endDate),
            getPetsReport(startDate, endDate),
            getVisitsReport(startDate, endDate),
            getFeedbacksReport(startDate, endDate),
            getLostPetsReport(startDate, endDate)
        ]);
        
        console.log('2️⃣ All reports fetched successfully');

        res.json({
            success: true,
            data: {
                appointments: appointmentsData,
                users: usersData,
                pets: petsData,
                visits: visitsData,
                feedbacks: feedbacksData,
                lostPets: lostPetsData
            }
        });
    } catch (error) {
        console.error('❌ Error fetching reports data:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error generating reports',
            error: error.message
        });
    }
};

/**
 * Get Appointments Report Data
 */
async function getAppointmentsReport(startDate, endDate) {
    // Build date filter condition
    const dateFilter = buildDateFilter('appointmentDate', startDate, endDate);
    
    // Get total appointments count
    const [totalResult] = await db.query(
        `SELECT COUNT(*) as total FROM appointment_tbl WHERE isDeleted = 0 ${dateFilter ? `AND ${dateFilter}` : ''}`
    );
    const totalAppointments = totalResult[0]?.total || 0;

    // Get completion rate (percentage of completed appointments)
    const [completedResult] = await db.query(
        `SELECT COUNT(*) as completed FROM appointment_tbl 
         WHERE statusID = 6 AND isDeleted = 0 ${dateFilter ? `AND ${dateFilter}` : ''}`
    );
    const completionRate = totalAppointments > 0 
        ? Math.round((completedResult[0]?.completed / totalAppointments) * 100) 
        : 0;

    // Get cancelled appointments count
    const [cancelledResult] = await db.query(
        `SELECT COUNT(*) as cancelled FROM appointment_tbl 
         WHERE statusID = 4 AND isDeleted = 0 ${dateFilter ? `AND ${dateFilter}` : ''}`
    );
    const cancelled = cancelledResult[0]?.cancelled || 0;

    // Get today's appointments
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${year}-${month}-${day}`;
    
    const [todayResult] = await db.query(
        `SELECT COUNT(*) as today FROM appointment_tbl 
         WHERE appointmentDate = ? AND isDeleted = 0`,
        [formattedToday]
    );
    const todayAppointments = todayResult[0]?.today || 0;

    // Get weekly trend (last 7 days)
    const weeklyTrend = await getWeeklyAppointmentTrend(startDate, endDate);

    // Get status breakdown
    const [statusBreakdown] = await db.query(
        `SELECT 
            ast.statusName,
            COUNT(*) as count
         FROM appointment_tbl at
         JOIN appointment_status_tbl ast ON at.statusID = ast.statusID
         WHERE at.isDeleted = 0 ${dateFilter ? `AND ${dateFilter}` : ''}
         GROUP BY at.statusID, ast.statusName
         ORDER BY at.statusID`
    );

    // Get peak hours
    const [peakHours] = await db.query(
        `SELECT 
            st.scheduleTime,
            COUNT(*) as count
         FROM appointment_tbl at
         JOIN scheduletime_tbl st ON at.scheduledTimeID = st.scheduledTimeID
         WHERE at.isDeleted = 0 ${dateFilter ? `AND ${dateFilter}` : ''}
         GROUP BY st.scheduledTimeID, st.scheduleTime
         ORDER BY st.scheduledTimeID`
    );

    // Format peak hours data (extract hour from scheduleTime)
    const formattedPeakHours = peakHours.map(item => ({
        hour: item.scheduleTime.substring(0, 5), // Get HH:MM format
        count: item.count
    }));

    return {
        kpi: {
            total: totalAppointments,
            completionRate,
            cancelled,
            today: todayAppointments
        },
        weeklyTrend,
        statusBreakdown,
        peakHours: formattedPeakHours
    };
}

/**
 * Get Users Report Data
 */
async function getUsersReport(startDate, endDate) {
    // Rebuild date filter without alias
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
        dateFilter = ` AND createdAt BETWEEN ? AND ?`;
        params.push(startDate, endDate);
    }
    
    // Total clients only (roleID = 1)
    const [totalClientsResult] = await db.query(
        `SELECT COUNT(*) as total FROM account_tbl 
         WHERE isDeleted = 0 AND roleID = 1`
    );
    const totalClients = totalClientsResult[0]?.total || 0;

    // New clients in period
    const [newResult] = await db.query(
        `SELECT COUNT(*) as new FROM account_tbl 
         WHERE isDeleted = 0 AND roleID = 1 ${dateFilter}`,
        params
    );
    const newClients = newResult[0]?.new || 0;

    // Users by role (for pie chart - all roles)
    const [usersByRole] = await db.query(
        `SELECT 
            rt.roleName,
            COUNT(*) as count
         FROM account_tbl at
         JOIN role_tbl rt ON at.roleID = rt.roleID
         WHERE at.isDeleted = 0
         GROUP BY at.roleID, rt.roleName`
    );

    // ACTIVE USERS - ONLY CLIENTS currently online (last 5 minutes)
    const [activeResult] = await db.query(
        `SELECT COUNT(DISTINCT uws.accID) as active 
         FROM user_websocket_sessions_tbl uws
         JOIN account_tbl acc ON uws.accID = acc.accId
         WHERE uws.isActive = 1 
         AND acc.roleID = 1
         AND uws.lastPingAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
    );
    const activeClients = activeResult[0]?.active || 0;

    // Clients with pets
    const [clientsWithPets] = await db.query(
        `SELECT 
            COUNT(DISTINCT at.accId) as withPets
         FROM account_tbl at
         JOIN pet_tbl pt ON at.accId = pt.accID
         WHERE at.isDeleted = 0 AND pt.isDeleted = 0
         AND at.roleID = 1`
    );
    const clientsWithPetsCount = clientsWithPets[0]?.withPets || 0;
    const clientsWithoutPets = totalClients - clientsWithPetsCount;

    // Get user registration trend (last 6 months or date range)
    let registrationTrendQuery = `
        SELECT 
            DATE_FORMAT(createdAt, '%b') as month,
            DATE_FORMAT(createdAt, '%Y-%m') as monthKey,
            COUNT(*) as count
         FROM account_tbl
         WHERE isDeleted = 0
         AND roleID = 1
    `;
    
    const trendParams = [];
    
    if (startDate && endDate) {
        registrationTrendQuery += ` AND createdAt BETWEEN ? AND ?`;
        trendParams.push(startDate, endDate);
    } else {
        registrationTrendQuery += ` AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`;
    }
    
    registrationTrendQuery += ` GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
                               ORDER BY monthKey ASC`;
    
    const [registrationTrend] = await db.query(registrationTrendQuery, trendParams);

    return {
        kpi: {
            total: totalClients,
            new: newClients,
            active: activeClients
        },
        byRole: usersByRole,
        petOwnership: {
            withPets: clientsWithPetsCount,
            withoutPets: clientsWithoutPets
        },
        registrationTrend
    };
}

/**
 * Get Pets Report Data
 */
async function getPetsReport(startDate, endDate) {
    // Rebuild date filter without alias
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
        dateFilter = ` AND createdAt BETWEEN ? AND ?`;
        params.push(startDate, endDate);
    }
    
    // Total pets
    const [totalResult] = await db.query(
        `SELECT COUNT(*) as total FROM pet_tbl WHERE isDeleted = 0`
    );
    const totalPets = totalResult[0]?.total || 0;

    // New pets in period
    const [newResult] = await db.query(
        `SELECT COUNT(*) as new FROM pet_tbl 
         WHERE isDeleted = 0 ${dateFilter}`,
        params
    );
    const newPets = newResult[0]?.new || 0;

    // Pets by species
    const [petsBySpecies] = await db.query(
        `SELECT 
            bt.species,
            COUNT(*) as count
         FROM pet_tbl pt
         JOIN breed_tbl bt ON pt.breedID = bt.breedID
         WHERE pt.isDeleted = 0
         GROUP BY bt.species`
    );

    // Pets by breed
    const [petsByBreed] = await db.query(
        `SELECT 
            bt.breedName,
            bt.species,
            COUNT(*) as count
         FROM pet_tbl pt
         JOIN breed_tbl bt ON pt.breedID = bt.breedID
         WHERE pt.isDeleted = 0
         GROUP BY pt.breedID, bt.breedName, bt.species
         ORDER BY count DESC
         LIMIT 10`
    );

    // Gender distribution
    const [genderResult] = await db.query(
        `SELECT 
            petGender,
            COUNT(*) as count
         FROM pet_tbl
         WHERE isDeleted = 0
         GROUP BY petGender`
    );

    // Average pet age
    const [ageResult] = await db.query(
        `SELECT 
            AVG(TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE())) as avgAge
         FROM pet_tbl
         WHERE isDeleted = 0 AND dateOfBirth IS NOT NULL`
    );
    const avgAge = Math.round(ageResult[0]?.avgAge || 0);

    // Get pet registration trend (last 6 months or date range)
    let petRegistrationTrendQuery = `
        SELECT 
            DATE_FORMAT(pt.createdAt, '%b') as month,
            DATE_FORMAT(pt.createdAt, '%Y-%m') as monthKey,
            COUNT(*) as count
        FROM pet_tbl pt
        JOIN account_tbl acc ON pt.accID = acc.accId
        WHERE pt.isDeleted = 0 
            AND acc.roleID = 1
    `;

    const trendParams = [];

    if (startDate && endDate) {
        petRegistrationTrendQuery += ` AND pt.createdAt BETWEEN ? AND ?`;
        trendParams.push(startDate, endDate);
    } else {
        petRegistrationTrendQuery += ` AND pt.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`;
    }

    petRegistrationTrendQuery += ` GROUP BY DATE_FORMAT(pt.createdAt, '%Y-%m')
                                  ORDER BY monthKey ASC`;

    const [petRegistrationTrend] = await db.query(petRegistrationTrendQuery, trendParams);

    return {
        kpi: {
            total: totalPets,
            new: newPets,
            avgAge
        },
        bySpecies: petsBySpecies,
        byBreed: petsByBreed,
        byGender: genderResult,
        registrationTrend: petRegistrationTrend
    };
}

/**
 * Get Visits/Appointments Trend Data
 */
async function getVisitsReport(startDate, endDate) {
    // Date filter based on actual visit date (visitDateTime for walk-ins, appointmentDate for scheduled)
    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
        dateFilter = ` AND DATE(COALESCE(visitDateTime, appointmentDate)) BETWEEN ? AND ?`;
        params.push(startDate, endDate);
    } else {
        dateFilter = ` AND DATE(COALESCE(visitDateTime, appointmentDate)) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`;
    }

    // Total visits = all completed appointments/visits (all-time, no month/date filter)
    const [totalCompletedResult] = await db.query(
        `SELECT COUNT(*) as total
         FROM appointment_tbl
         WHERE isDeleted = 0 AND statusID = 6`
    );
    
    // Daily trend by weekday (Monday to Sunday)
    const [dailyTrend] = await db.query(
        `SELECT 
            DAYNAME(DATE(COALESCE(visitDateTime, appointmentDate))) as day,
            CASE DAYOFWEEK(DATE(COALESCE(visitDateTime, appointmentDate)))
                WHEN 2 THEN 1
                WHEN 3 THEN 2
                WHEN 4 THEN 3
                WHEN 5 THEN 4
                WHEN 6 THEN 5
                WHEN 7 THEN 6
                WHEN 1 THEN 7
            END as dayOrder,
            COUNT(*) as count
         FROM appointment_tbl
         WHERE isDeleted = 0 AND statusID = 6 ${dateFilter}
         GROUP BY DAYNAME(DATE(COALESCE(visitDateTime, appointmentDate))), DAYOFWEEK(DATE(COALESCE(visitDateTime, appointmentDate)))
         ORDER BY dayOrder ASC`,
        params
    );

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${year}-${month}-${day}`;

    const [todayResult] = await db.query(
        `SELECT COUNT(*) as today
         FROM appointment_tbl
         WHERE isDeleted = 0
         AND statusID = 6
         AND (
            appointmentDate = ?
            OR DATE(visitDateTime) = ?
         )`,
        [formattedToday, formattedToday]
    );

    // Visit types distribution
    const [visitTypes] = await db.query(
        `SELECT 
            visitType,
            COUNT(*) as count
         FROM appointment_tbl
         WHERE isDeleted = 0 AND statusID = 6 ${dateFilter}
         GROUP BY visitType`,
        params
    );

    // Services popularity
    const [topServices] = await db.query(
        `SELECT 
            s.service,
            s.serviceID,
            COUNT(*) as count
         FROM appointment_tbl at
         JOIN service_tbl s ON at.serviceID = s.serviceID
         WHERE at.isDeleted = 0 AND at.statusID = 6 ${dateFilter.replace(/COALESCE\(visitDateTime, appointmentDate\)/g, 'COALESCE(at.visitDateTime, at.appointmentDate)')}
         GROUP BY at.serviceID, s.service
         ORDER BY count DESC
         LIMIT 5`,
        params
    );

    // Daily average visits
    const [dailyAvg] = await db.query(
        `SELECT 
            AVG(daily_count) as dailyAverage
         FROM (
            SELECT 
                DATE(COALESCE(visitDateTime, appointmentDate)) as visitDate,
                COUNT(*) as daily_count
            FROM appointment_tbl
            WHERE isDeleted = 0 AND statusID = 6 ${dateFilter}
            GROUP BY DATE(COALESCE(visitDateTime, appointmentDate))
         ) as daily`,
        params
    );

    // Most popular day of week
    const [popularDay] = await db.query(
        `SELECT 
            DAYNAME(DATE(COALESCE(visitDateTime, appointmentDate))) as dayName,
            COUNT(*) as count
         FROM appointment_tbl
         WHERE isDeleted = 0 AND statusID = 6 ${dateFilter}
         GROUP BY DAYNAME(DATE(COALESCE(visitDateTime, appointmentDate)))
         ORDER BY count DESC
         LIMIT 1`,
        params
    );

    return {
        kpi: {
            total: totalCompletedResult[0]?.total || 0
        },
        dailyTrend,
        visitTypes,
        topServices,
        insights: {
            today: todayResult[0]?.today || 0,
            dailyAverage: Math.round(dailyAvg[0]?.dailyAverage || 0),
            mostPopularDay: popularDay[0]?.dayName || 'N/A',
            mostPopularDayCount: popularDay[0]?.count || 0
        }
    };
}

/**
 * Get Feedbacks Report Data
 */
async function getFeedbacksReport(startDate, endDate) {
    const dateFilter = buildDateFilter('ft.createdAt', startDate, endDate);
    
    // Total feedbacks
    const [totalResult] = await db.query(
        `SELECT COUNT(*) as total FROM feedbacks_tbl`
    );
    const totalFeedbacks = totalResult[0]?.total || 0;

    // Average rating
    const [ratingResult] = await db.query(
        `SELECT AVG(rating) as avgRating FROM feedbacks_tbl`
    );
    const avgRating = parseFloat(ratingResult[0]?.avgRating || 0).toFixed(1);

    // Rating distribution
    const [ratingDistribution] = await db.query(
        `SELECT 
            rating,
            COUNT(*) as count
         FROM feedbacks_tbl
         GROUP BY rating
         ORDER BY rating DESC`
    );

    // Anonymous vs identified
    const [anonymousResult] = await db.query(
        `SELECT 
            isAnonymous,
            COUNT(*) as count
         FROM feedbacks_tbl
         GROUP BY isAnonymous`
    );

    // Recent feedbacks
    const [recentFeedbacks] = await db.query(
        `SELECT 
            ft.*,
            at.firstName,
            at.lastName,
            at.email
         FROM feedbacks_tbl ft
         LEFT JOIN account_tbl at ON ft.accID = at.accId
         ORDER BY ft.createdAt DESC
         LIMIT 10`
    );

    // Feedback trend over time (last 6 months)
    let feedbackTrendQuery = `
        SELECT 
            DATE_FORMAT(createdAt, '%b') as month,
            DATE_FORMAT(createdAt, '%Y-%m') as monthKey,
            COUNT(*) as count,
            AVG(rating) as avgRating
         FROM feedbacks_tbl
         WHERE 1=1
    `;
    
    const trendParams = [];
    
    if (startDate && endDate) {
        feedbackTrendQuery += ` AND createdAt BETWEEN ? AND ?`;
        trendParams.push(startDate, endDate);
    } else {
        feedbackTrendQuery += ` AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`;
    }
    
    feedbackTrendQuery += ` GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
                           ORDER BY monthKey ASC`;
    
    const [feedbackTrend] = await db.query(feedbackTrendQuery, trendParams);

    // Rating breakdown percentages
    const ratingBreakdown = ratingDistribution.map(item => {
        const percentage = totalFeedbacks > 0 
            ? Math.round((item.count / totalFeedbacks) * 100) 
            : 0;
        return {
            rating: item.rating,
            count: item.count,
            percentage
        };
    });

    return {
        kpi: {
            total: totalFeedbacks,
            avgRating
        },
        ratingDistribution: ratingBreakdown,
        anonymousStats: anonymousResult,
        recent: recentFeedbacks,
        trend: feedbackTrend
    };
}

/**
 * Get Lost & Found Pets Report Data
 */
async function getLostPetsReport(startDate, endDate) {
    // Rebuild date filter without the 'fp.' prefix since we'll add it in the query
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
        dateFilter = ` AND fp.createdAt BETWEEN ? AND ?`;
        params.push(startDate, endDate);
    }
    
    // Total posts
    const [totalResult] = await db.query(
        `SELECT COUNT(*) as total FROM forum_posts_tbl fp WHERE fp.isDeleted = 0`,
        params
    );
    const totalPosts = totalResult[0]?.total || 0;

    // Lost vs Found distribution
    const [typeDistribution] = await db.query(
        `SELECT 
            fp.postType,
            COUNT(*) as count
         FROM forum_posts_tbl fp
         WHERE fp.isDeleted = 0 ${dateFilter}
         GROUP BY fp.postType`,
        params
    );

    // Anonymous vs identified
    const [anonymousResult] = await db.query(
        `SELECT 
            fp.isAnonymous,
            COUNT(*) as count
         FROM forum_posts_tbl fp
         WHERE fp.isDeleted = 0 ${dateFilter}
         GROUP BY fp.isAnonymous`,
        params
    );

    // Monthly trend
    const [monthlyTrend] = await db.query(
        `SELECT 
            DATE_FORMAT(fp.createdAt, '%b %Y') as month,
            DATE_FORMAT(fp.createdAt, '%Y-%m') as monthKey,
            SUM(CASE WHEN fp.postType = 'Lost' THEN 1 ELSE 0 END) as lost,
            SUM(CASE WHEN fp.postType = 'Found' THEN 1 ELSE 0 END) as found,
            COUNT(*) as total
         FROM forum_posts_tbl fp
         WHERE fp.isDeleted = 0 ${dateFilter}
         GROUP BY DATE_FORMAT(fp.createdAt, '%Y-%m')
         ORDER BY monthKey DESC
         LIMIT 12`,
        params
    );

    // Success rate (found vs lost)
    const lostCount = typeDistribution.find(t => t.postType === 'Lost')?.count || 0;
    const foundCount = typeDistribution.find(t => t.postType === 'Found')?.count || 0;
    const successRate = lostCount > 0 ? Math.round((foundCount / lostCount) * 100) : 0;

    // Most recent active posts
    const [recentPosts] = await db.query(
        `SELECT 
            fp.*,
            a.firstName,
            a.lastName,
            (SELECT COUNT(*) FROM forum_images_tbl WHERE forumID = fp.forumID AND isDeleted = 0) as imageCount
         FROM forum_posts_tbl fp
         LEFT JOIN account_tbl a ON fp.accID = a.accId
         WHERE fp.isDeleted = 0 ${dateFilter}
         ORDER BY fp.createdAt DESC
         LIMIT 5`,
        params
    );

    return {
        kpi: {
            total: totalPosts,
            lost: lostCount,
            found: foundCount,
            successRate
        },
        typeDistribution,
        anonymousStats: anonymousResult,
        monthlyTrend,
        recentPosts
    };
}

/**
 * Helper function to get weekly appointment trend
 */
async function getWeeklyAppointmentTrend(startDate, endDate) {
    let query = `
        SELECT 
            DAYNAME(appointmentDate) as day,
            COUNT(*) as count
        FROM appointment_tbl
        WHERE isDeleted = 0
        AND appointmentDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `;
    
    const params = [];
    
    if (startDate && endDate) {
        query = `
            SELECT 
                DAYNAME(appointmentDate) as day,
                COUNT(*) as count
            FROM appointment_tbl
            WHERE isDeleted = 0
            AND appointmentDate BETWEEN ? AND ?
        `;
        params.push(startDate, endDate);
    }
    
    query += ` GROUP BY DAYNAME(appointmentDate), DAYOFWEEK(appointmentDate)
               ORDER BY DAYOFWEEK(appointmentDate)`;
    
    const [results] = await db.query(query, params);
    
    // Ensure all days are represented
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyData = days.map(day => {
        const found = results.find(r => r.day === day);
        return {
            day,
            count: found ? parseInt(found.count) : 0
        };
    });
    
    return weeklyData;
}

/**
 * Helper function to build date filter condition
 */
function buildDateFilter(dateField, startDate, endDate) {
    if (startDate && endDate) {
        return `${dateField} BETWEEN '${startDate}' AND '${endDate}'`;
    }
    return '';
}