const fs = require('fs');
const path = require('path');

class EmailService {
    constructor(provider1, provider2) {
        this.provider1 = provider1;
        this.provider2 = provider2;
        this.statusTracker = new StatusTracker();
        this.logger = new Logger();
        this.emailQueue = new Queue();
        this.maxRetries = 3;
        this.rateLimitCounter = 0;
        this.rateLimitThreshold = 10;
        this.rateLimitInterval = 60000; // 1 minute
        setInterval(() => this.resetRateLimit(), this.rateLimitInterval);
        this.processQueue(); // Start processing the queue
    }

    async sendEmail(to, subject, body) {
        const emailData = { to, subject, body, id: this.generateUniqueId() };
        this.emailQueue.enqueue(emailData); // Add email to the queue
        this.logger.log(`Email added to queue: ${emailData.id}`);
        return this.statusTracker.getStatus(emailData.id) || 'Pending';
    }

    async processQueue() {
        while (true) {
            const emailData = this.emailQueue.dequeue();
            if (emailData) {
                this.logger.log(`Processing email: ${emailData.id}`);
                const status = await this.fallbackSend(emailData);
                this.logger.log(`Email processing completed: ${emailData.id} with status: ${status}`);
            }
            await this.sleep(1000); // Prevent tight loop
        }
    }

    async retrySend(provider, emailData, attempt = 1) {
        try {
            if (this.rateLimit()) {
                this.trackStatus(emailData.id, 'Failed');
                this.logger.log(`Rate limit exceeded. Email failed: ${emailData.id}`);
                return 'Failed';
            }

            const status = await provider.sendEmail(emailData);
            this.trackStatus(emailData.id, status);

            if (status === 'Success') {
                this.logger.log(`Email sent successfully: ${emailData.id}`);
                return status;
            } else if (attempt < this.maxRetries) {
                this.trackStatus(emailData.id, 'Retrying');
                this.logger.log(`Retrying email: ${emailData.id}, attempt: ${attempt}`);
                await this.sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
                return this.retrySend(provider, emailData, attempt + 1);
            } else {
                this.logger.log(`Max retries reached. Email failed: ${emailData.id}`);
                return 'Failed';
            }
        } catch (error) {
            this.trackStatus(emailData.id, 'Failed');
            this.logger.log(`Error sending email: ${emailData.id} - ${error.message}`);
            return 'Failed';
        }
    }

    async fallbackSend(emailData) {
        let status = await this.retrySend(this.provider1, emailData);

        if (status === 'Failed') {
            this.logger.log(`Fallback to provider2 for email: ${emailData.id}`);
            status = await this.retrySend(this.provider2, emailData);
        }

        return status;
    }

    rateLimit() {
        this.rateLimitCounter++;
        if (this.rateLimitCounter > this.rateLimitThreshold) {
            this.logger.log(`Rate limit exceeded: ${this.rateLimitCounter}`);
            return true;
        }
        return false;
    }

    resetRateLimit() {
        this.logger.log('Rate limit reset');
        this.rateLimitCounter = 0;
    }

    trackStatus(id, status) {
        this.statusTracker.trackStatus(id, status);
    }

    generateUniqueId() {
        return Math.random().toString(36).substring(2, 15);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class Logger {
    constructor() {
        this.logFilePath = path.join(__dirname, 'logs', 'app.log');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFilePath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(message) {
        const logMessage = `[${new Date().toISOString()}] ${message}\n`;
        fs.appendFileSync(this.logFilePath, logMessage, 'utf8');
        console.log(message); // Optional: still log to console
    }
}

class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

class StatusTracker {
    constructor() {
        this.statuses = {};
    }

    trackStatus(id, status) {
        this.statuses[id] = status;
    }

    getStatus(id) {
        return this.statuses[id];
    }
}

class MockEmailProvider1 {
    async sendEmail({ to, subject, body }) {
        console.log(`Sending email via Provider 1: to=${to}, subject=${subject}`);
        // Simulate a random failure
        if (Math.random() > 0.7) {
            return 'Failed';
        }
        return 'Success';
    }
}

class MockEmailProvider2 {
    async sendEmail({ to, subject, body }) {
        console.log(`Sending email via Provider 2: to=${to}, subject=${subject}`);
        // Simulate a random failure
        if (Math.random() > 0.7) {
            return 'Failed';
        }
        return 'Success';
    }
}

module.exports = { EmailService, MockEmailProvider1, MockEmailProvider2 };
