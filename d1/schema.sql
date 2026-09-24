CREATE TABLE coffees (
  id          INTEGER PRIMARY KEY,
  videoId     TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  pubDate     TEXT    NOT NULL,
  videoTitle  TEXT    NOT NULL,
  imgUrl      TEXT    NOT NULL,
  orderTime   INTEGER NOT NULL,
  reviewTime  INTEGER NOT NULL,
  reviewText  TEXT    NOT NULL,
  note        TEXT,
  CHECK (reviewTime > orderTime),
  CHECK (name = trim(name) AND length(name) > 0),
  CHECK (length(trim(reviewText)) > 0),
  CHECK (length(videoId) = 11),
  CHECK (pubDate GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')
);

CREATE TABLE lpItems (
  id       INTEGER PRIMARY KEY,
  category TEXT    NOT NULL CHECK (category IN ('works', 'recommends', 'coffees')),
  "order"  INTEGER NOT NULL,
  url      TEXT    NOT NULL,
  imgUrl   TEXT    NOT NULL,
  head     TEXT    NOT NULL,
  body     TEXT    NOT NULL,
  UNIQUE (category, "order")
);

CREATE TABLE links (
  id      INTEGER PRIMARY KEY,
  "order" INTEGER NOT NULL UNIQUE,
  text    TEXT    NOT NULL,
  url     TEXT    NOT NULL
);

CREATE TABLE profiles (
  id      INTEGER PRIMARY KEY,
  "order" INTEGER NOT NULL UNIQUE,
  head    TEXT    NOT NULL,
  body    TEXT    NOT NULL
);

CREATE TABLE events (
  id           INTEGER PRIMARY KEY,
  yyyymm       TEXT    NOT NULL CHECK (yyyymm GLOB '[0-9][0-9][0-9][0-9][0-9][0-9]'),
  branchNumber INTEGER NOT NULL,
  category     TEXT    NOT NULL CHECK (category IN ('works', 'topics')),
  name         TEXT    NOT NULL,
  url          TEXT,
  UNIQUE (yyyymm, branchNumber)
);

CREATE TABLE landingPage (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  greeting   TEXT NOT NULL,
  annotation TEXT NOT NULL
);