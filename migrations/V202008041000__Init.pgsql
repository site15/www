CREATE TABLE IF NOT EXISTS project_types (
    id serial NOT NULL,
    name varchar(100) NOT NULL,
    title varchar(255) NOT NULL,
    title_ru varchar(255) NOT NULL,
    CONSTRAINT "PK_PROJECT_TYPES" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "IDX_PROJECT_TYPES__NAME" ON project_types (name);

CREATE TABLE IF NOT EXISTS projects (
    id serial NOT NULL,
    name varchar(100) NOT NULL,
    title varchar(255) NOT NULL,
    title_ru varchar(255) NOT NULL,
    project_type_id integer NOT NULL,
    CONSTRAINT "PK_PROJECTS" PRIMARY KEY (id),
    CONSTRAINT "FK_PROJECTS__PROJECT_TYPE_ID" FOREIGN KEY (project_type_id) REFERENCES project_types ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_PROJECTS__PROJECT_TYPE_ID" ON projects (project_type_id);

CREATE TABLE IF NOT EXISTS project_type_counters (
    id serial NOT NULL,
    name varchar(100) NOT NULL,
    title varchar(255) NOT NULL,
    title_ru varchar(255) NOT NULL,
    project_type_id integer NOT NULL,
    CONSTRAINT "PK_PROJECT_TYPE_COUNTERS" PRIMARY KEY (id),
    CONSTRAINT "FK_PROJECT_TYPE_COUNTERS__PROJECT_TYPE_ID" FOREIGN KEY (project_type_id) REFERENCES project_types ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_PROJECT_TYPE_COUNTERS__NAME" ON project_type_counters (name);

CREATE TABLE IF NOT EXISTS project_counters (
    id serial NOT NULL,
    project_id integer NOT NULL,
    project_type_counter_id integer NOT NULL,
    CONSTRAINT "PK_PROJECT_COUNTERS" PRIMARY KEY (id),
    CONSTRAINT "FK_PROJECT__ID" FOREIGN KEY (project_id) REFERENCES projects ON DELETE CASCADE,
    CONSTRAINT "FK_PROJECT_COUNTERS__PROJECT_TYPE_COUNTER_ID" FOREIGN KEY (project_type_counter_id) REFERENCES project_type_counters ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_PROJECT_COUNTERS" ON project_counters (project_id, project_type_counter_id);

CREATE TABLE IF NOT EXISTS contact_types (
    id serial NOT NULL,
    name varchar(100) NOT NULL,
    title varchar(255) NOT NULL,
    title_ru varchar(255) NOT NULL,
    CONSTRAINT "PK_CONTACT_TYPES" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "IDX_CONTACT_TYPES__NAME" ON contact_types (name);

CREATE TABLE IF NOT EXISTS contacts (
    id serial NOT NULL,
    name varchar(100) NOT NULL,
    title varchar(255) NOT NULL,
    title_ru varchar(255) NOT NULL,
    contact_type_id integer NOT NULL,
    CONSTRAINT "PK_CONTACTS" PRIMARY KEY (id),
    CONSTRAINT "FK_CONTACTS__CONTACT_TYPE_ID" FOREIGN KEY (contact_type_id) REFERENCES contact_types ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_CONTACTS__CONTACT_TYPE_ID" ON contacts (contact_type_id);

INSERT INTO contact_types (name, title, title_ru) VALUES ( 'email', 'Email', 'Emial');
INSERT INTO contact_types (name, title, title_ru) VALUES ( 'github_user', 'Github account name', 'Github account name');
INSERT INTO contact_types (name, title, title_ru) VALUES ( 'github_org', 'Github organization name', 'Github organization name');
INSERT INTO contact_types (name, title, title_ru) VALUES ( 'npm_user', 'Npm account name', 'Npm account name');
INSERT INTO contact_types (name, title, title_ru) VALUES ( 'npm_org', 'Npm organization name', 'Npm organization name');
INSERT INTO contact_types (name, title, title_ru) VALUES ( 'twitter_user', 'Twitter account name', 'Twitter account name');
INSERT INTO contact_types (name, title, title_ru) VALUES ( 'dev_to_user', 'Dev.to account name', 'Dev.to account name');

INSERT INTO project_types (name, title, title_ru) VALUES ( 'github', 'Github project', 'Github project');
INSERT INTO project_types (name, title, title_ru) VALUES ( 'npm', 'Npm library', 'Npm library');
INSERT INTO project_types (name, title, title_ru) VALUES ( 'docker', 'Docker image', 'Docker image');
INSERT INTO project_types (name, title, title_ru) VALUES ( 'twitter', 'Twitter message', 'Twitter message');
INSERT INTO project_types (name, title, title_ru) VALUES ( 'dev_to', 'Dev.to post', 'Dev.to post');