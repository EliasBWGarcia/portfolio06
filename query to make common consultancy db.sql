-- CREATE DATABASE `common_consultancy`;
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

load data infile 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/common_consultncy/sourcepop.csv' into table sourcepop
fields terminated by '";"'
lines starting by '"' terminated by '"\n'
ignore 1 lines;

-- time
drop table if exists time;
create table time (
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

load data infile 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/common_consultncy/time.csv' into table time
fields terminated by '";"'
lines starting by '"' terminated by '"\n'
ignore 1 lines;

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

load data infile 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/common_consultncy/metrics.csv' into table metrics
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

load data infile 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/common_consultncy/classification.csv' into table classification
fields terminated by ';' OPTIONALLY ENCLOSED BY '"'
lines terminated by '\n'
ignore 1 lines;