DROP SCHEMA IF EXISTS `common_consultancy`;
CREATE DATABASE `common_consultancy`;
USE common_consultancy;

SHOW VARIABLES LIKE "secure_file_priv"; -- if secure file privilege is enebled, this is the only folder you can make write operations from

-- sourcepop
drop table if exists sourcepop;
create table sourcepop (
	ccpageid int,
    `name` varchar(100),
    party varchar(100),
    category varchar(100),
    country varchar(100)
);

load data infile 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/common_consultancy/sourcepop.csv' into table sourcepop
fields terminated by '";"'
lines starting by '"' terminated by '"\n'
ignore 1 lines;

-- work around for delete duplicates with a temptable to groupby and therefore eliminating duplicates
CREATE TEMPORARY TABLE temp_table AS -- we make a temporary table identical to the original table but we group by all collumns so that we get no duplicates since they will new be showing as the same row
SELECT *
FROM sourcepop
GROUP BY ccpageid, `name`, party, category, country;

TRUNCATE TABLE sourcepop; -- we truncate witch means to deletes all data without any arguments needed

INSERT INTO sourcepop -- we insert our aggrigated data from the temp-table so that there are only one of each
SELECT *
FROM temp_table;

DROP TEMPORARY TABLE temp_table; -- we delete the temp table

ALTER TABLE sourcepop  -- we make the ccpageid primary key
ADD PRIMARY KEY (ccpageid);

-- time
drop table if exists `time`;
create table `time` (
	ccpost_id bigint,
    `date` date,
    `day` int,
    `month` int,
    `time` varchar(100),
    yearweek int,
    yearmonth varchar(7),
    yearquarter varchar(6),
    `year` year
);

load data infile 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/common_consultancy/time.csv' into table time
fields terminated by '";"'
lines starting by '"' terminated by '"\n'
ignore 1 lines;

-- work around for delete duplicates with a temptable to groupby and therefore eliminating duplicates
CREATE TEMPORARY TABLE temp_table AS -- we make a temporary table identical to the original table but we group by all collumns so that we get no duplicates since they will new be showing as the same row
SELECT *
FROM `time`
GROUP BY ccpost_id, `date`, `day`, `month`, `time`, yearweek, yearmonth, yearquarter, `year`;

TRUNCATE TABLE `time`; -- we truncate witch means to deletes all data without any arguments needed

INSERT INTO `time` -- we insert our aggrigated data from the temp-table so that there are only one of each
SELECT *
FROM temp_table;

DROP TEMPORARY TABLE temp_table; -- we delete the temp table

ALTER TABLE time  -- we make the ccpageid primary key
ADD PRIMARY KEY (ccpost_id);

-- metrics
drop table if exists metrics;
create table metrics (
	ccpost_id bigint,
    ccpageid bigint,
    post_type varchar(100),
    video_length int,
    followers_at_posting int,
    reactions int,
    likes int,
    loves int,
    wows int,
    sads int,
    hahas int,
    angrys int,
    cares int,
    comments int,
    shares int,
    total_interactions int,
    engagement_rate varchar(1), -- engagement_rate does not have any data
    proportion_of_likes int,
    proportion_of_loves int,
    proportion_of_hahas int,
    proportion_of_wows int,
    proportion_of_sads int,
    proportion_of_angrys int,
    proportion_of_cares int,
    proportion_of_shares int,
    proportion_of_comments int,
    proportion_of_reactions int
);

load data infile 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/common_consultancy/metrics.csv' into table metrics
fields terminated by ';' OPTIONALLY ENCLOSED BY '"'
lines terminated by '\n'
ignore 1 lines;
-- SET engagement_rate = NULLIF(engagement_rate, ""); -- we make sure that if the field is empty, it is set to the value of null

-- classification
drop table if exists classification;
create table classification (
	ccpost_id bigint,
    all_post_text LONGTEXT,
    gpt_ukraine_for_imod varchar(1000)
    -- ENUM('for', 'imod')
);

load data infile 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/common_consultancy/classification.csv' into table classification
fields terminated by ';' OPTIONALLY ENCLOSED BY '"'
lines terminated by '\n'
ignore 1 lines;

UPDATE classification
SET all_post_text = REPLACE (all_post_text, '\\\\\\\\\\\\«', '');

-- work around for delete duplicates with a temptable to groupby and therefore eliminating duplicates
CREATE TEMPORARY TABLE temp_table AS -- we make a temporary table identical to the original table but we group by all collumns so that we get no duplicates since they will new be showing as the same row
SELECT *
FROM classification
GROUP BY ccpost_id, all_post_text, gpt_ukraine_for_imod;

TRUNCATE TABLE classification; -- we truncate witch means to deletes all data without any arguments needed

INSERT INTO classification -- we insert our aggrigated data from the temp-table so that there are only one of each
SELECT *
FROM temp_table;

DROP TEMPORARY TABLE temp_table; -- we delete the temp table