-- ============================================================
-- SlopeTime — seed data
-- Run AFTER 001_init.sql.
-- Paste into the Supabase SQL editor and execute.
-- ============================================================

-- ---- Resorts ----
insert into public.resorts (id, name, lat, lng) values
  ('deer-valley', 'Deer Valley Resort',        40.6374, -111.4783),
  ('park-city',   'Park City Mountain',         40.6514, -111.5080),
  ('snowbird',    'Snowbird',                   40.5831, -111.6556),
  ('brighton',    'Brighton Resort',            40.5986, -111.5833),
  ('solitude',    'Solitude Mountain Resort',   40.6199, -111.5920)
on conflict (id) do update
  set name = excluded.name,
      lat  = excluded.lat,
      lng  = excluded.lng;

-- ---- Lifts — Deer Valley ----
insert into public.lifts (resort_id, lift_name, lift_minutes, run_minutes, vert_ft, difficulty, terrain, representative_run) values
  ('deer-valley', 'Jordanelle Express', 12,  8, 1300, 'blue',         'groomers', 'Bald Eagle'),
  ('deer-valley', 'Sterling Express',    7,  5,  600, 'green',        'groomers', 'Success'),
  ('deer-valley', 'Carpenter Express',   8,  6,  800, 'blue',         'groomers', 'Nabob'),
  ('deer-valley', 'Wasatch Express',     9,  7,  900, 'blue',         'groomers', 'Tycoon'),
  ('deer-valley', 'Flagstaff Express',  10,  8, 1100, 'black',        'groomers', 'Hawkeye'),
  ('deer-valley', 'Empire Express',     10,  8, 1200, 'black',        'groomers', 'Stein''s Way'),
  ('deer-valley', 'Lady Morgan',         8,  7,  900, 'blue',         'groomers', 'Lady Morgan Bowl'),
  ('deer-valley', 'Burns',               6,  5,  600, 'blue',         'groomers', 'Burns'),
  ('deer-valley', 'Little Stick',        5,  4,  350, 'green',        'groomers', 'Snowflake');

-- ---- Lifts — Park City ----
insert into public.lifts (resort_id, lift_name, lift_minutes, run_minutes, vert_ft, difficulty, terrain, representative_run) values
  ('park-city', 'First Time',    5,  4,  300, 'green', 'groomers', 'First Time'),
  ('park-city', 'Crescent',      6,  5,  500, 'green', 'groomers', 'Homerun'),
  ('park-city', 'PayDay',        8,  6,  700, 'blue',  'groomers', 'PayDay'),
  ('park-city', 'Bonanza',       9,  7,  900, 'blue',  'groomers', 'Bonanza'),
  ('park-city', 'Silverlode',   10,  7, 1000, 'blue',  'groomers', 'Silverlode'),
  ('park-city', 'King Con',     10,  8, 1100, 'black', 'moguls',   'King Con'),
  ('park-city', 'Motherlode',    7,  6,  800, 'blue',  'groomers', 'Motherlode'),
  ('park-city', 'Flatiron',      9,  8, 1100, 'black', 'groomers', 'Flatiron'),
  ('park-city', 'Iron Mountain', 9,  8, 1000, 'black', 'bowls',    'Iron Mountain'),
  ('park-city', 'Tombstone',     7,  6,  700, 'blue',  'groomers', 'Tombstone'),
  ('park-city', 'Dreamscape',    8,  6,  750, 'blue',  'groomers', 'Dreamscape');

-- ---- Lifts — Snowbird ----
insert into public.lifts (resort_id, lift_name, lift_minutes, run_minutes, vert_ft, difficulty, terrain, representative_run) values
  ('snowbird', 'Aerial Tram',           9, 14, 2900, 'double-black', 'bowls',    'Great Scott'),
  ('snowbird', 'Peruvian Express',       8,  9, 1300, 'black',        'groomers', 'Chip''s Run'),
  ('snowbird', 'Gad 2',                  8,  7,  900, 'blue',         'groomers', 'Chip''s Run Lower'),
  ('snowbird', 'Little Cloud',           9, 11, 1400, 'double-black', 'bowls',    'Upper Cirque'),
  ('snowbird', 'Mineral Basin Express', 10,  9, 1400, 'black',        'bowls',    'Bassackwards'),
  ('snowbird', 'Baldy Express',          9,  8, 1100, 'black',        'moguls',   'Regulator Johnson'),
  ('snowbird', 'Road to Provo',          7,  6,  800, 'blue',         'groomers', 'Big Emma Lower'),
  ('snowbird', 'Baby Thunder',           5,  4,  400, 'green',        'groomers', 'Big Emma');

-- ---- Lifts — Brighton ----
insert into public.lifts (resort_id, lift_name, lift_minutes, run_minutes, vert_ft, difficulty, terrain, representative_run) values
  ('brighton', 'Explorer',    6,  5,  500, 'green', 'groomers', 'Explorer'),
  ('brighton', 'Majestic',    8,  6,  800, 'blue',  'groomers', 'Majestic'),
  ('brighton', 'Milly',       8,  7,  900, 'blue',  'groomers', 'Milly'),
  ('brighton', 'Crest 6',    10,  8, 1200, 'black', 'groomers', 'Lone Pine'),
  ('brighton', 'Snake Creek',  9,  9, 1300, 'black', 'trees',    'Snake Creek'),
  ('brighton', 'Evergreen',    8,  7,  900, 'black', 'trees',    'Evergreen');

-- ---- Lifts — Solitude ----
insert into public.lifts (resort_id, lift_name, lift_minutes, run_minutes, vert_ft, difficulty, terrain, representative_run) values
  ('solitude', 'Summit',        9, 8, 1000, 'black', 'groomers', 'Dynamite'),
  ('solitude', 'Powderhorn',    8, 7,  800, 'blue',  'groomers', 'Powderhorn'),
  ('solitude', 'Eagle Express', 9, 8, 1000, 'black', 'bowls',    'Honeycomb Canyon'),
  ('solitude', 'Apex',          8, 7,  900, 'black', 'trees',    'Apex'),
  ('solitude', 'Sunrise',       7, 5,  650, 'blue',  'groomers', 'Sunrise'),
  ('solitude', 'Link',          5, 4,  400, 'green', 'groomers', 'Woodsy Hollow');
