CREATE FUNCTION FilmsJson(id int) 
RETURNS table (film json) AS
$$
BEGIN
    RETURN QUERY  SELECT row_to_json(filmrow) FROM (SELECT filmname, filmdescription FROM films WHERE filmid < id) as filmrow;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION filmdata(IN id INT) 
RETURNS TABLE (j JSON) AS
$BODY$
BEGIN
    RETURN QUERY  
        SELECT 
            row_to_json(filmrow)
        FROM (
            SELECT 
                filmid AS id,
                filmname AS name,
                filmdescription AS description,
                (SELECT array_to_json(array_agg(row_to_json(studio)))
                FROM (
                    SELECT copyrightownername AS name
                    FROM copyrightowners INNER JOIN films ON films.copyrightownerid=copyrightowners.copyrightownerid
                    WHERE filmid=id
                ) studio
                ) AS copyrightowner
            FROM films 
            WHERE filmid = id
        ) AS filmrow;
END;
$BODY$ LANGUAGE plpgsql;

CREATE FUNCTION copyrightdata(IN id INT) 
RETURNS TABLE (j JSON) AS
$BODY$
BEGIN
    RETURN QUERY  
    SELECT to_json(sub) AS studio
    FROM (
    SELECT copyrightownername as name, json_agg(filmname) as films
        FROM copyrightowners
            LEFT JOIN films ON copyrightowners.copyrightownerid = films.copyrightownerid
        GROUP BY copyrightowners.copyrightownerid
    ) as sub;

END;
$BODY$ LANGUAGE plpgsql;

CREATE FUNCTION filmscards(IN OFST INT)
RETURNS TABLE (j JSON) AS
$BODY$
BEGIN
    RETURN QUERY
    SELECT row_to_json(r, true)
    FROM (
        SELECT
            f.filmid, 
            f.filmname,
            f.filmdescription,
            f.filmposterlink,
            AVG(ufr.rating),
            json_agg(g_row) AS genres
        FROM films f
        LEFT JOIN usersfilmsratings ufr ON (ufr.filmid = f.filmid)
        INNER JOIN filmsgenres fg ON (fg.filmid = f.filmid)
        INNER JOIN (
            SELECT  
                g.genreid,       
                g.genrename    
            FROM genres g
        ) g_row(id, name) ON (g_row.id = fg.genreid)
        GROUP BY f.filmid
        OFFSET OFST
        LIMIT 10
    ) r(id, name,description,poster,rating, genres);
END;
$BODY$ LANGUAGE plpgsql;

CREATE FUNCTION filmscardsgenre(IN OFST INT, IN GENRE VARCHAR)
RETURNS TABLE
(j JSON) AS
$BODY$
BEGIN
    RETURN QUERY
    SELECT row_to_json(r, true)
    FROM (
        (SELECT
            f.filmid, 
            f.filmname,
            f.filmdescription,
            f.filmposterlink,
            AVG(ufr.rating),
            json_agg(g_row) AS genres
        FROM films f
        LEFT JOIN usersfilmsratings ufr ON (ufr.filmid = f.filmid)
        INNER JOIN filmsgenres fg ON (fg.filmid = f.filmid)
        INNER JOIN (
            SELECT  
                g.genreid,       
                g.genrename    
            FROM genres g
        ) g_row(id, name) ON (g_row.id = fg.genreid)
		WHERE f.filmname IN (
			SELECT filmname
			FROM films as f
			INNER JOIN filmsgenres as fg ON (fg.filmid = f.filmid)
			INNER JOIN genres as g ON (g.genreid = fg.genreid)
			WHERE g.genrename = GENRE
		)
        GROUP BY f.filmid
        OFFSET OFST
        LIMIT 10)
		
    ) r(id, name,description,poster,rating, genres);
END;
$BODY$ LANGUAGE plpgsql;


CREATE FUNCTION dashboard()
RETURNS TABLE
(j JSON) AS
$BODY$
BEGIN
    RETURN QUERY
    SELECT json_agg(f)->0 FROM(
        SELECT
            (SELECT SUM(userspent) FROM users) as income,
            (SELECT COUNT(filmid) FROM films) as filmscount,
            (SELECT COUNT(userid) FROM users) as userscount,
            (SELECT COUNT(userid) FROM users WHERE userstatus = 'Premium') as premiumuserscount,
            (SELECT COUNT(copyrightownerid) FROM copyrightowners) as copyrightownerscount,
            (SELECT filmname FROM films ORDER BY filmviews DESC LIMIT 1) as topfilm,
            (SELECT json_agg(a) FROM (
                SELECT row_to_json(t) as copyright
                FROM (
                    SELECT copyrightownername, SUM(filmmonltyviews) as totalviews
                    FROM copyrightowners INNER JOIN films ON films.copyrightownerid = copyrightowners.copyrightownerid
                    GROUP BY copyrightownername
                ) as t
            ) as a --END FROM
            ) as studiosdata, -- END SELECT,
            (SELECT json_agg(mi) FROM
                (SELECT 
                    to_char(paymentdate,'Mon') AS month,
                    SUM(amount) AS income
                FROM userpayments
                GROUP BY date_trunc('month', paymentdate),to_char(paymentdate,'Mon')
                ORDER BY date_trunc('month', paymentdate)) AS mi
            ) as incomeData
        ) as f;
END;
$BODY$ LANGUAGE plpgsql;

CREATE FUNCTION monthly()
RETURNS VOID AS
$BODY$
    DECLARE totalfilmsviews INTEGER := (SELECT SUM("filmmonltyviews") FROM "films");
            totalincome FLOAT := (SELECT SUM("userspent") FROM "users");
            copyrightrow RECORD;
            copyrightownerviews INTEGER;
            payment FLOAT := 0; 
BEGIN 
    INSERT INTO settlements("settlementdate") VALUES (current_timestamp);
    FOR copyrightrow IN SELECT * FROM copyrightowners
    LOOP
        copyrightownerviews := (SELECT SUM("filmmonltyviews") FROM "films" WHERE "copyrightownerid"=copyrightrow.copyrightownerid);
        IF (totalfilmsviews = 0) THEN
            payment := 0;
        ELSIF (copyrightownerviews IS NULL) THEN
            payment := 0;
        ELSE
            payment := (cast(copyrightownerviews as decimal)/totalfilmsviews)*totalincome*0.7;
        END IF;
        INSERT INTO "settlementscopyrightowners"("settlementid","copyrightownerid","amount") VALUES
            ((SELECT MAX("settlementid") FROM "settlements"),copyrightrow.copyrightownerid, payment);
    END LOOP;
     UPDATE films SET "filmmonltyviews" = 0;
     UPDATE users SET "userspent" = 0;
END;
$BODY$ LANGUAGE plpgsql;


-- SELECT row_to_json(r, true)
-- FROM (
--     SELECT
--         g.genreid,   
--         g.genrename, 
--         json_agg(f_row) AS films
--     FROM genres g
--     INNER JOIN filmsgenres fg ON (fg.genreid = g.genreid)
--     INNER JOIN (
--         SELECT  
--             f.filmid,       
--             f.filmname,     
--             json_agg(p) AS persons
--         FROM films f
--         INNER JOIN filmsactors fa ON (fa.filmid = f.filmid) 
--         INNER JOIN (
-- 			SELECT
-- 				personid,
-- 				personname
-- 			FROM
-- 				people
-- 		) p(id,name) ON (fa.personid = p.id) 
--         GROUP BY f.filmid 
--     ) f_row(id, name, person) ON (f_row.id = fg.filmid)
--     GROUP BY g.genreid
-- ) r(id, name, film);


-- SELECT row_to_json(r, true)
-- FROM (
--     SELECT
--         c.copyrightownerid,   
--         c.copyrightownername, 
--         json_agg(f_row) AS films
--     FROM copyrightowners c
--     INNER JOIN (
--         SELECT  
--             f.filmid as id,       
--             f.filmname as name,
-- 			f.copyrightownerid,
--             json_agg(fa) AS person
--         FROM films f
--         INNER JOIN (
-- 			SELECT
-- 				filmid,
-- 				personid as person
-- 			FROM
-- 				filmsactors
-- 		) fa(filmid,person) ON (fa.filmid = f.filmid) 
--         GROUP BY f.filmid 
--     ) f_row(id, name, copyrightownerid, person) ON (f_row.copyrightownerid = c.copyrightownerid)
--     GROUP BY c.copyrightownerid
-- ) r(id, name, film);


--PROCEDURE DASHBOARD
-- SELECT row_to_json(t)
-- FROM
-- 	(SELECT 
-- 		(SELECT SUM(userspent) FROM users) as income,
-- 		(SELECT COUNT(filmid) FROM films) as filmscount,
-- 		(SELECT COUNT(userid) FROM users) as userscount,
-- 		(SELECT COUNT(userid) FROM users WHERE userstatus = 'Premium') as premiumuserscount,
-- 		(SELECT COUNT(copyrightownerid) FROM copyrightowners) as copyrightownerscount,
-- 		(SELECT filmname FROM films ORDER BY filmviews DESC LIMIT 1) as topfilm
-- 	) as t




--  SELECT row_to_json(t)
--  FROM
--  	(SELECT 
--  		(SELECT SUM(userspent) FROM users) as income,
--  		(SELECT COUNT(filmid) FROM films) as filmscount,
--  		(SELECT COUNT(userid) FROM users) as userscount,
--  		(SELECT COUNT(userid) FROM users WHERE userstatus = 'Premium') as premiumuserscount,
--  		(SELECT COUNT(copyrightownerid) FROM copyrightowners) as copyrightownerscount,
--  		(SELECT filmname FROM films ORDER BY filmviews DESC LIMIT 1) as topfilm,
-- 	 	(SELECT json_agg(a) FROM (SELECT row_to_json(t) as copyright
-- 		FROM(
-- 			SELECT copyrightownername, SUM(filmmonltyviews) as totalviews
-- 			FROM copyrightowners INNER JOIN films ON films.copyrightownerid = copyrightowners.copyrightownerid
-- 			GROUP BY copyrightownername) as t) as a
-- 		) as studiosdata
--  	) as t

-- SELECT Date = DATEADD(MONTH, DATEDIFF(MONTH, 0, Date), 0),
--     SUM(Amount) monthlyIncome
-- FROM MyTable
-- WHERE   Date >= '2018-01-01'
--     AND Date <= '2018-12-31'
-- GROUP BY DATEADD(MONTH, DATEDIFF(MONTH, 0, Closing_Date), 0);