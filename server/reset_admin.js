const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const prisma = new PrismaClient();
async function run() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.update({
        where: { id: 1 },
        data: {
            email: 'admin@nordensuits.com',
            password: hashedPassword
        }
    });
    console.log('Admin user updated:', user.email);
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
