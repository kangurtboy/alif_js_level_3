CREATE TABLE banners (
	id BIGSERIAL PRIMARY KEY,
	title TEXT NOT NULL,
	content TEXT NOT NULL,
	button TEXT NOT NULL,
	link TEXT NOT NULL,
	image TEXT NOT NULL,
	created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);