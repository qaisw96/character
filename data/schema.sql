DROP TABLE IF EXISTS chracters;

CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    house VARCHAR(255),
    patronus VARCHAR(255),
    is_alive boolean NOT NULL DEFAULT true,
    add_by VARCHAR(255)
);