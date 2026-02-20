const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSettings = async (req, res) => {
    try {
        const { category } = req.query;
        const where = category ? { category } : {};
        const settings = await prisma.setting.findMany({ where });
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSetting = async (req, res) => {
    try {
        const { key, value, category } = req.body;
        const setting = await prisma.setting.upsert({
            where: { key },
            update: { value, category },
            create: { key, value, category }
        });
        res.json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getSettings, updateSetting };
