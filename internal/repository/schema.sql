

CREATE TYPE user_role AS ENUM ('user', 'helper', 'admin');
CREATE TABLE users (
  id UUID PRIMARY KEY,

  nickname TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'user',


  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE crisis (
  id UUID PRIMARY KEY ,
  user_id UUID NOT NULL REFERENCES users(id),

  current_step TEXT NOT NULL,
  risk_level TEXT NOT NULL,

  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,

  result TEXT NOT NULL
);
