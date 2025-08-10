export const requireAuth = (req, res, next) => {
    const sessionUserId = req.session?.userId;
    const cookieUserId = req.cookies?.userId;
    console.log('Auth check - Session:', sessionUserId, 'Cookie:', cookieUserId);
    console.log('Full session data:', req.session);
    const userId = sessionUserId || (cookieUserId ? parseInt(cookieUserId) : null);
    if (!userId) {
        console.log('Authentication failed - no valid user ID');
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    if (!req.session.userId) {
        req.session.userId = userId;
    }
    if (userId === 1 && !req.session.userRole) {
        req.session.userRole = 'admin';
        req.session.username = 'admin';
    }
    console.log('Authentication successful for user:', userId, 'Role:', req.session.userRole);
    next();
};
export const requireAdmin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    if (req.session.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin privileges required'
        });
    }
    next();
};
export const requireFacilitator = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    if (req.session.userRole !== 'admin' && req.session.userRole !== 'facilitator') {
        return res.status(403).json({
            success: false,
            error: 'Facilitator privileges required'
        });
    }
    next();
};
export const attachUser = (req, res, next) => {
    if (req.session.userId) {
        req.user = {
            id: req.session.userId,
            username: req.session.username || '',
            role: req.session.userRole || 'participant',
            name: '',
            email: ''
        };
    }
    next();
};
