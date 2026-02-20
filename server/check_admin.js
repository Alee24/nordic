const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
async function run() {
    const users = await prisma.user.findMany({
        where: { role: 'admin' }
    });
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
