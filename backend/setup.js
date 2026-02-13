const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    try {
        // Connect to MySQL
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            multipleStatements: true
        });

        console.log('✓ Connected to MySQL');

        // Read SQL file
        const sqlPath = path.join(__dirname, '..', 'migrations', 'setup_nordic_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute SQL
        await connection.query(sql);

        console.log('✓ Database setup completed');

        // Verify data
        await connection.query('USE nordic');

        const [propResult] = await connection.query('SELECT COUNT(*) as count FROM properties');
        const [roomResult] = await connection.query('SELECT COUNT(*) as count FROM rooms');
        const [userResult] = await connection.query('SELECT COUNT(*) as count FROM users');

        console.log('\n📊 Database Status:');
        console.log(`   Properties: ${propResult[0].count}`);
        console.log(`   Rooms: ${roomResult[0].count}`);
        console.log(`   Users: ${userResult[0].count}`);

        if (propResult[0].count > 0 && roomResult[0].count > 0) {
            console.log('\n🎉 Database is ready!');
            console.log('   You can now start the API server with: npm start\n');
        }

        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    }
}

setupDatabase();
