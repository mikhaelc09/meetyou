const db = require('../models/index.js');

module.exports = {
    checkLimit: async (req, res, next) => {
        //check limit per month using created_at field
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const user = await db.User.findOne({
            where: { email: req.user.email },
            include: {
                model: db.Tier,
                as: 'tier'
            }
        });

        const ctr = await db.History.count({
            where: {
                user_id: user.id,
                created_at: {
                    [db.Sequelize.Op.between]: [firstDay, lastDay]
                },
            }
        });

        if (ctr >= user.tier.limit){
            return res.status(400).json({ error: "Limit Exceeded" });
        }

        return next();
    },
}


