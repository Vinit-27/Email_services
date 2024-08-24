# Resilient Email Sending Service

## Overview

This project implements a resilient email-sending service using JavaScript (Node.js) and Express. The service is designed to handle email sending with the following features:

- **Retry Logic** with exponential backoff
- **Fallback Mechanism** to switch between multiple email providers
- **Idempotency** to prevent duplicate email sends
- **Rate Limiting** to control the number of email sends within a specified period
- **Status Tracking** for email sending attempts
- **Logging** for tracking the flow and issues
- **Queue System** to manage email sending jobs

## Features

- **Retry Mechanism:** The service retries email sending in case of failures with exponential backoff to avoid overloading the server.
- **Fallback Between Providers:** If the primary email provider fails, the service automatically falls back to a secondary provider.
- **Idempotency:** Ensures that duplicate emails are not sent for the same request.
- **Rate Limiting:** Limits the number of emails that can be sent within a certain time frame to avoid spamming.
- **Status Tracking:** Tracks and provides the status of email sending attempts.
- **Logging:** Provides detailed logs of the operations and errors.
- **Queue System:** Manages email sending jobs, processing them sequentially.

## Prerequisites

- **Node.js** (version 18 or later)
- **Docker** and **Docker Compose** (for containerized deployment)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/email-service.git
   cd email-service

2. **Install the dependencies:**

    ```bash
    npm install

3. **Run the service locally:**

    ```bash
    node index.js
The service will start on http://localhost:3000.

## Docker Setup

**Building and Running with Docker**

1. **Build the Docker image:**

    ```bash
    docker-compose build

2. **Run the Docker container:**

    ```bash
    docker-compose up -d

The service will be available on http://localhost:3000.


## Usage

**Sending an Email**

To send an email, make a POST request to the /send-email endpoint with the following JSON body:

    {
        "to": "recipient@example.com",
        "subject": "Hello",
        "body": "This is a test email."
    }



## Logging and Monitoring

Logs are stored in a file within the container:

- **Log File Path:** `logs/app.log`

You can view the logs using Docker commands:

- **View logs within the container:**

  ```bash
  docker exec -it <container_id> cat /usr/src/app/logs/app.log

- **Access container’s shell to view logs directly:**

  ```bash
  docker exec -it <container_id> /bin/sh

Then navigate to /usr/src/app/logs and view the app.log file.

## Project Structure
- **index.js**: The main entry point of the application.
- **emailService.js**: Contains the EmailService class and its dependencies (e.g., mock providers, logger, queue).
- **Dockerfile**: Defines the Docker image for the application.
- **docker-compose.yml**: Docker Compose file to manage the service.
