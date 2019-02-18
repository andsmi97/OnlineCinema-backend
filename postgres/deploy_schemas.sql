-- Deploy fresh database tables:
-- @ts-ignore
\i '/docker-entrypoint-initdb.d/tables/OnlineCinema.sql'

-- For testing purposes only. This file will add dummy data
\i '/docker-entrypoint-initdb.d/seed/seed.sql'