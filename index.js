const express = require('express');
const { EmailService, MockEmailProvider1, MockEmailProvider2 } = require('./emailService');

const app = express();
app.use(express.json());

const provider1 = new MockEmailProvider1();
const provider2 = new MockEmailProvider2();
const emailService = new EmailService(provider1, provider2);

app.post('/send-email', async (req, res) => {
    const { to, subject, body } = req.body;
    try {
        const status = await emailService.sendEmail(to, subject, body);
        res.json({ status });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
