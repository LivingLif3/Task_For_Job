create TABLE person(
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    password VARCHAR(255),
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    image VARCHAR(255),
    pdf VARCHAR(255)
)

create TABLE token(
    refreshToken VARCHAR,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES person (id)
)
