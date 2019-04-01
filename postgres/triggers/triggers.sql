CREATE FUNCTION usr_stamp() RETURNS trigger AS $usr_stamp$
    BEGIN
        -- Check that empname and salary are given
        IF NEW.userid = 1 THEN
            INSERT INTO usersbenchmarks("userid","userbenchmarkname","userbenchmarkdate") VALUES (1, '1ый пользователь', current_timestamp);
        END IF;
        IF NEW.userid = 100 THEN
            INSERT INTO usersbenchmarks("userid","userbenchmarkname","userbenchmarkdate") VALUES (100, '100ый пользователь', current_timestamp);
        END IF;
        IF NEW.userid = 1000 THEN
            INSERT INTO usersbenchmarks("userid","userbenchmarkname","userbenchmarkdate") VALUES (1000, '5ый пользователь', current_timestamp);
        END IF;
        RETURN NEW;
    END;
$usr_stamp$ LANGUAGE plpgsql;


CREATE TRIGGER benchmarks 
AFTER INSERT ON users
FOR EACH ROW
EXECUTE PROCEDURE usr_stamp()
