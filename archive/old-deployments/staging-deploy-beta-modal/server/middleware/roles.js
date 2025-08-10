export const isAdmin = (req, res, next) => {
    const userRole = req.session?.userRole;
    const userId = req.session?.userId;
    console.log('Admin check - UserID:', userId, 'Role:', userRole);
    console.log('Full session in admin check:', req.session);
    if (userId === 1) {
        if (!req.session.userRole) {
            req.session.userRole = 'admin';
        }
        console.log('Admin access granted for user 1');
        next();
        return;
    }
    if (userRole !== 'admin') {
        console.log('Admin access denied - Role:', userRole, 'UserID:', userId);
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to access the admin panel',
            currentRole: userRole,
            userId: userId
        });
    }
    console.log('Admin access granted for role:', userRole);
    next();
};
export const isFacilitator = (req, res, next) => {
    if (!req.session || !req.session.userId || req.session.userRole !== 'facilitator') {
        return res.status(403).json({ error: 'Facilitator access required' });
    }
    next();
};
export const isFacilitatorOrAdmin = (req, res, next) => {
    const userRole = req.session?.userRole;
    const userId = req.session?.userId;
    console.log('Facilitator/Admin check - UserID:', userId, 'Role:', userRole);
    if (userId === 1) {
        if (!req.session.userRole) {
            req.session.userRole = 'admin';
        }
        console.log('Management access granted for admin user 1');
        next();
        return;
    }
    if (userRole !== 'admin' && userRole !== 'facilitator') {
        console.log('Management access denied - Role:', userRole, 'UserID:', userId);
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to access the management console',
            currentRole: userRole,
            userId: userId
        });
    }
    console.log('Management access granted for role:', userRole);
    next();
};
export const isParticipant = (req, res, next) => {
    if (!req.session || !req.session.userId || req.session.userRole !== 'participant') {
        return res.status(403).json({ error: 'Participant access required' });
    }
    next();
};
