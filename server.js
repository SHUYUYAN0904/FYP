const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
};

const app = express();
app.use(express.json());

app.listen(port, () => {
    console.log('Server is running on port', port);
});

app.get('/reports', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM reports');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error for reports' });
    }
});

// Route: Authenticate an admin user
app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM admin WHERE admin_name = ? AND admin_password = ?',
            [username, password]
        );

        if (rows.length > 0) {
            res.status(200).json({ message: 'Login successful', user: rows[0] });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not login user' });
    }
});

// Route: Retrieves details of a specific report
app.get('/reports/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM report WHERE report_id = ?',
            [id]
        );

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not retrieve report ' + id });
    }
});

// Route: Adds a new report
app.post('/reports', async (req, res) => {
    const { report_title, report_date, importance, user_id, category_id, description, status } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO report (report_title, report_date, importance, user_id, category_id, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [report_title, report_date, importance, user_id, category_id, description, status]
        );
        res.status(201).json({ message: 'Report ' + report_title + ' added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not add report ' + report_title });
    }
});

// Route: Updates an existing report
app.put('/reports/:id', async (req, res) => {
    const { id } = req.params;
    const { report_title, report_date, importance, user_id, category_id, description, status } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE report SET report_title = ?, report_date = ?, importance = ?, user_id = ?, category_id = ?, description = ?, status = ? WHERE report_id = ?',
            [report_title, report_date, importance, user_id, category_id, description, status, id]
        );
        res.status(200).json({ message: 'Report ' + id + ' updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update report ' + id });
    }
});

// Route: Delete a specific report
app.delete('/reports/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM report WHERE report_id = ?',
            [id]
        );
        res.status(200).json({ message: 'Report ' + id + ' deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete report ' + id });
    }
});

// Route: Adds a new response
app.post('/response', async (req, res) => {
    const { admin_id, report_id, description } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO response (admin_id, report_id, description) VALUES (?, ?, ?)',
            [admin_id, report_id, description]
        );
        res.status(201).json({ message: 'Response added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not add response' });
    }
});

// Route: Retrieves a list of all response
app.get('/response', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM response');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not retrieve response' });
    }
});

// Route: Retrieves details of a specific response
app.get('/response/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM response WHERE response_id = ?',
            [id]
        );

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Response not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not retrieve response ' + id });
    }
});

// Route: Updates an existing response
app.put('/response/:id', async (req, res) => {
    const { id } = req.params;
    const { admin_id, report_id, description } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE response SET admin_id = ?, report_id = ?, description = ? WHERE response_id = ?',
            [admin_id, report_id, description, id]
        );
        res.status(200).json({ message: 'Response ' + id + ' updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update response ' + id });
    }
});