## Get Started

1. **Run Docker to Start Services:**

    Start the backend app, PostgreSQL, and Redis by running Docker Compose with the provided environment file:

    ```bash
    docker-compose --env-file backend/.env up -d
    ```

2. **Navigate to Frontend Directory:**

    Change directory to the frontend folder `/frontend/react-batch-transactions`.

3. **Install Dependencies:**

    Use npm to install the required dependencies:

    ```bash
    npm install
    ```

4. **Run the Application:**

    Start the application by running:

    ```bash
    npm run dev
    ```

5. **Access the Application:**

    Open your browser and navigate to the following URL to access the application:

    [http://localhost:5173](http://localhost:5173)

## Tech Stack

- **Backend:** Go
- **Database:** PostgreSQL
- **Cache:** Redis (used for storing OTP on registration purpose)
- **Frontend:** ReactJS, TailwindCSS

- Backend Folder: `/backend`
- Frontend Folder: `/frontend/react-batch-transactions`

- **Backend Endpoint:** The backend is running on [http://localhost:8080](http://localhost:8080).
- **Frontend Endpoint:** The frontend is accessible at [http://localhost:5173](http://localhost:5173).


## Database Design

#### Table: users

This table store registered user, password are hashed for stronger security
- **id:** Serial primary key for the user.
- **account_number:** Unique identifier for the user's account.
- **account_name:** Name associated with the user's account.
- **user_id:** Unique identifier for the user.
- **user_name:** Unique name for the user.
- **role:** Enumerated type representing the user's role (`Maker` or `Approver`).
- **phone_number:** Unique phone number associated with the user.
- **email:** Unique email address associated with the user.
- **password:** Hashed password for user authentication.
- **last_login_at:** Timestamp indicating the last login time of the user.
- **created_at:** Timestamp indicating the creation time of the user record.

#### Table: transactions

This table store main information of uploaded transaction, any uploaded transaction will have transaction status `Waiting Approval`, approver user can approve / reject.
Should have relation to users table(maker - users.user_id), but not yet added
- **id:** UUID primary key for the transaction.
- **total_amount:** Total amount involved in the transaction.
- **total_record:** Total number of records in the transaction.
- **from_account:** Account from which the transaction originates.
- **maker:** User who initiated the transaction.
- **transfer_date:** Timestamp indicating the transfer date of the transaction.
- **transaction_status:** Enumerated type representing the status of the transaction (`waiting_approval`, `approved`, or `rejected`).
- **created_at:** Timestamp indicating the creation time of the transaction record.

#### Table: transaction_details

This table have relation with transaction, the main transaction can have multiple transaction details that can be viewed by user, transaction details has relationship to transaction id
- **id:** UUID primary key for the transaction detail.
- **transaction_id:** Foreign key referencing the transaction to which the detail belongs.
- **bank_dest:** Bank destination for the transaction.
- **account_id_dest:** Destination account identifier for the transaction.
- **account_name_dest:** Name associated with the destination account.
- **amount:** Amount involved in the transaction detail.
- **description:** Description of the transaction detail.
- **transfer_date:** Timestamp indicating the transfer date of the transaction detail.

## Endpoint list
### Endpoint List

#### Healthcheck

- **GET** `/health`

#### Send OTP

- **POST** `/api/otp/send`

#### Register User

- **POST** `/api/auth/register`

#### Login User

- **POST** `/api/auth/login`

#### Transactions

_All `/api/transactions` endpoints require access token provided on Authorization Header._

- **Create Transaction by Uploading CSV**

  - **POST** `/api/transactions/create`

- **Summary of Total Transactions**

  - **GET** `/api/transactions/summary`

- **Auditing Purpose (Verify or Reject Transaction)**

  - **PATCH** `/api/transactions/{id}`

- **Get List of Transactions**

  - **GET** `/api/transactions`

- **Transaction Detail (View Detail)**

  - **GET** `/api/transactions/{id}`




