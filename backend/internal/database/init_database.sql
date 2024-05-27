CREATE TYPE user_role AS ENUM ('Maker', 'Approver');

CREATE TABLE users (
	id serial PRIMARY KEY,
	account_number varchar(13) UNIQUE NOT NULL,
	account_name varchar(60) NOT NULL,
	user_id varchar(13) UNIQUE NOT NULL,
	user_name varchar(100) UNIQUE NOT NULL,
	role user_role NOT NULL,
	phone_number varchar(15) UNIQUE NOT NULL,
	email varchar(100) UNIQUE NOT NULL,
    "password" varchar(128) NOT NULL,
    last_login_at timestamp,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TYPE transaction_status AS ENUM ('waiting_approval','approved','rejected');
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_amount DECIMAL(15,2) NOT NULL,
    total_record int NOT NULL,
    from_account varchar(60) NOT NULL,
    maker varchar(60) NOT NULL,
    transfer_date timestamp,
    -- bank_dest varchar(60) NOT NULL,
    -- account_id_dest varchar(60) NOT NULL,
    -- account_name_dest varchar(60) NOT NULL,
    -- amount DECIMAL(15,2) NOT NULL,
    transaction_status transaction_status NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE transaction_details (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	transaction_id UUID,
    bank_dest varchar(60) NOT NULL,
    account_id_dest varchar(60) NOT NULL,
    account_name_dest varchar(60) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description text,
    transfer_date timestamp,
    CONSTRAINT fk_transaction_details_transaction_id FOREIGN KEY (transaction_id)
    REFERENCES transactions(id)
);


 