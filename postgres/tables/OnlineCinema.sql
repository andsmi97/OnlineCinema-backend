/*==============================================================*/
/* DBMS name:      PostgreSQL 8                                 */
/* Created on:     18.02.2019 15:42:51                          */
/*==============================================================*/


/*==============================================================*/
/* Table: CopyrightOwners                                       */
/*==============================================================*/
create table CopyrightOwners (
   CopyrightOwnerID     SERIAL                 not null,
   CopyrightOwnerName   VARCHAR(255)         null,
   constraint PK_COPYRIGHTOWNERS primary key (CopyrightOwnerID),
   constraint AK_KEY_2_COPYRIGH unique (CopyrightOwnerName)
);

/*==============================================================*/
/* Table: Films                                                 */
/*==============================================================*/
create table Films (
   FilmID               SERIAL                 not null,
   FilmName             VARCHAR(255)         not null,
   FilmReleaseDate      DATE                 null,
   FilmAgeRestriction   INT2                 null,
   FilmLength           INT4                 null,
   FilmLink             TEXT                 null default 'Films/NoFilmYet.avi',
   FilmPrice            FLOAT8               null default 99
      constraint CKC_FILMPRICE_FILMS check (FilmPrice is null or (FilmPrice between 0 and 2000)),
   FilmPosterLink       TEXT                 null default 'img/NoPosterYet.jpg',
   FilmDescription      TEXT                 null,
   FilmBudget           FLOAT8               null,
   FilmViews            INT8                 null default 0
      constraint CKC_FILMVIEWS_FILMS check (FilmViews is null or (FilmViews >= 0)),
   CopyrightOwnerID     INT4                 null,
   FilmMonltyViews      INT4                 null,
   constraint PK_FILMS primary key (FilmID),
   constraint FK_FILMS_FILMSCOPY_COPYRIGH foreign key (CopyrightOwnerID)
      references CopyrightOwners (CopyrightOwnerID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Table: Countries                                             */
/*==============================================================*/
create table Countries (
   CountryID            SERIAL                 not null,
   CountryName          VARCHAR(60)          not null,
   constraint PK_COUNTRIES primary key (CountryID)
);

/*==============================================================*/
/* Table: Cities                                                */
/*==============================================================*/
create table Cities (
   CountryID            SERIAL                 not null,
   CityID               INT4                 not null,
   CityName             VARCHAR(255)         not null,
   constraint PK_CITIES primary key (CityID),
   constraint FK_CITIES_RELATIONS_COUNTRIE foreign key (CountryID)
      references Countries (CountryID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Table: People                                                */
/*==============================================================*/
create table People (
   CityID               SERIAL                 not null,
   PersonID             INT4                 not null,
   PersonName           VARCHAR(255)         not null,
   PersonBirthday       DATE                 null,
   PersonAvatar         TEXT                 null default 'img/NoAvatarYet.jpg',
   PersonFacts          TEXT                 null,
   constraint PK_PEOPLE primary key (PersonID),
   constraint FK_PEOPLE_RELATIONS_CITIES foreign key (CityID)
      references Cities (CityID)
      on delete set null on update cascade
);

/*==============================================================*/
/* Table: Awards                                                */
/*==============================================================*/
create table Awards (
   AwardID              SERIAL                 not null,
   AwardName            VARCHAR(255)         not null,
   AwardCategory        VARCHAR(255)         not null,
   AwardYear            DATE                 not null,
   FilmID               INT4                 null,
   PersonID             INT4                 null,
   constraint PK_AWARDS primary key (AwardID),
   constraint FK_AWARDS_REFERENCE_FILMS foreign key (FilmID)
      references Films (FilmID),
   constraint FK_AWARDS_REFERENCE_PEOPLE foreign key (PersonID)
      references People (PersonID)
);

/*==============================================================*/
/* Index: Relationship_21_FK                                    */
/*==============================================================*/
create  index Relationship_21_FK on Cities (
CountryID
);

/*==============================================================*/
/* Index: Films_Name                                            */
/*==============================================================*/
create  index Films_Name on Films (
FilmName
);

/*==============================================================*/
/* Index: Films_Length                                          */
/*==============================================================*/
create  index Films_Length on Films (
FilmLength
);

/*==============================================================*/
/* Index: Films_Price                                           */
/*==============================================================*/
create  index Films_Price on Films (
FilmPrice
);

/*==============================================================*/
/* Table: FilmsActors                                           */
/*==============================================================*/
create table FilmsActors (
   FilmID               INT4                 not null,
   PersonID             INT4                 not null,
   Role                 VARCHAR(255)         null,
   constraint PK_FILMSACTORS primary key (FilmID, PersonID),
   constraint FK_FILMSACT_RELATIONS_FILMS foreign key (FilmID)
      references Films (FilmID)
      on delete cascade on update cascade,
   constraint FK_FILMSACT_RELATIONS_PEOPLE foreign key (PersonID)
      references People (PersonID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Index: Relationship_1_FK                                     */
/*==============================================================*/
create  index Relationship_1_FK on FilmsActors (
FilmID
);

/*==============================================================*/
/* Index: Relationship_7_FK                                     */
/*==============================================================*/
create  index Relationship_7_FK on FilmsActors (
PersonID
);

/*==============================================================*/
/* Table: FilmsComposers                                        */
/*==============================================================*/
create table FilmsComposers (
   FilmID               INT4                 not null,
   PersonID             INT4                 not null,
   constraint PK_FILMSCOMPOSERS primary key (FilmID, PersonID),
   constraint FK_FILMSCOM_RELATIONS_FILMS foreign key (FilmID)
      references Films (FilmID)
      on delete cascade on update cascade,
   constraint FK_FILMSCOM_RELATIONS_PEOPLE foreign key (PersonID)
      references People (PersonID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Index: Relationship_5_FK                                     */
/*==============================================================*/
create  index Relationship_5_FK on FilmsComposers (
FilmID
);

/*==============================================================*/
/* Index: Relationship_11_FK                                    */
/*==============================================================*/
create  index Relationship_11_FK on FilmsComposers (
PersonID
);

/*==============================================================*/
/* Table: FilmsCountries                                        */
/*==============================================================*/
create table FilmsCountries (
   FilmID               INT4                 not null,
   CountryID            INT4                 not null,
   constraint PK_FILMSCOUNTRIES primary key (FilmID, CountryID),
   constraint FK_FILMSCOU_RELATIONS_FILMS foreign key (FilmID)
      references Films (FilmID)
      on delete cascade on update cascade,
   constraint FK_FILMSCOU_RELATIONS_COUNTRIE foreign key (CountryID)
      references Countries (CountryID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Index: Relationship_13_FK                                    */
/*==============================================================*/
create  index Relationship_13_FK on FilmsCountries (
FilmID
);

/*==============================================================*/
/* Index: Relationship_14_FK                                    */
/*==============================================================*/
create  index Relationship_14_FK on FilmsCountries (
CountryID
);

/*==============================================================*/
/* Table: FilmsDesigners                                        */
/*==============================================================*/
create table FilmsDesigners (
   FilmID               INT4                 not null,
   PersonID             INT4                 not null,
   constraint PK_FILMSDESIGNERS primary key (FilmID, PersonID),
   constraint FK_FILMSDES_RELATIONS_FILMS foreign key (FilmID)
      references Films (FilmID)
      on delete cascade on update cascade,
   constraint FK_FILMSDES_RELATIONS_PEOPLE foreign key (PersonID)
      references People (PersonID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Index: Relationship_6_FK                                     */
/*==============================================================*/
create  index Relationship_6_FK on FilmsDesigners (
FilmID
);

/*==============================================================*/
/* Index: Relationship_12_FK                                    */
/*==============================================================*/
create  index Relationship_12_FK on FilmsDesigners (
PersonID
);

/*==============================================================*/
/* Table: FilmsDirectors                                        */
/*==============================================================*/
create table FilmsDirectors (
   FilmID               INT4                 not null,
   PersonID             INT4                 not null,
   constraint PK_FILMSDIRECTORS primary key (FilmID, PersonID),
   constraint FK_FILMSDIR_RELATIONS_FILMS foreign key (FilmID)
      references Films (FilmID)
      on delete cascade on update cascade,
   constraint FK_FILMSDIR_RELATIONS_PEOPLE foreign key (PersonID)
      references People (PersonID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Index: Relationship_2_FK                                     */
/*==============================================================*/
create  index Relationship_2_FK on FilmsDirectors (
FilmID
);

/*==============================================================*/
/* Index: Relationship_8_FK                                     */
/*==============================================================*/
create  index Relationship_8_FK on FilmsDirectors (
PersonID
);

/*==============================================================*/
/* Table: Genres                                                */
/*==============================================================*/
create table Genres (
   GenreID              SERIAL                 not null,
   GenreName            VARCHAR(255)         not null,
   constraint PK_GENRES primary key (GenreID)
);

/*==============================================================*/
/* Table: FilmsGenres                                           */
/*==============================================================*/
create table FilmsGenres (
   FilmID               INT4                 not null,
   GenreID              INT4                 not null,
   constraint PK_FILMSGENRES primary key (FilmID, GenreID),
   constraint FK_FILMSGEN_RELATIONS_FILMS foreign key (FilmID)
      references Films (FilmID)
      on delete cascade on update cascade,
   constraint FK_FILMSGEN_RELATIONS_GENRES foreign key (GenreID)
      references Genres (GenreID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Index: Relationship_15_FK                                    */
/*==============================================================*/
create  index Relationship_15_FK on FilmsGenres (
FilmID
);

/*==============================================================*/
/* Index: Relationship_16_FK                                    */
/*==============================================================*/
create  index Relationship_16_FK on FilmsGenres (
GenreID
);

/*==============================================================*/
/* Table: FilmsProducers                                        */
/*==============================================================*/
create table FilmsProducers (
   FilmID               INT4                 not null,
   PersonID             INT4                 not null,
   constraint PK_FILMSPRODUCERS primary key (FilmID, PersonID),
   constraint FK_FILMSPRO_RELATIONS_FILMS foreign key (FilmID)
      references Films (FilmID)
      on delete cascade on update cascade,
   constraint FK_FILMSPRO_RELATIONS_PEOPLE foreign key (PersonID)
      references People (PersonID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Index: Relationship_4_FK                                     */
/*==============================================================*/
create  index Relationship_4_FK on FilmsProducers (
FilmID
);

/*==============================================================*/
/* Index: Relationship_10_FK                                    */
/*==============================================================*/
create  index Relationship_10_FK on FilmsProducers (
PersonID
);

/*==============================================================*/
/* Table: FilmsScriptwriters                                    */
/*==============================================================*/
create table FilmsScriptwriters (
   FilmID               INT4                 not null,
   PersonID             INT4                 not null,
   constraint PK_FILMSSCRIPTWRITERS primary key (FilmID, PersonID),
   constraint FK_FILMSSCR_RELATIONS_FILMS foreign key (FilmID)
      references Films (FilmID)
      on delete cascade on update cascade,
   constraint FK_FILMSSCR_RELATIONS_PEOPLE foreign key (PersonID)
      references People (PersonID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Index: Relationship_3_FK                                     */
/*==============================================================*/
create  index Relationship_3_FK on FilmsScriptwriters (
FilmID
);

/*==============================================================*/
/* Index: Relationship_9_FK                                     */
/*==============================================================*/
create  index Relationship_9_FK on FilmsScriptwriters (
PersonID
);

/*==============================================================*/
/* Index: Relationship_22_FK                                    */
/*==============================================================*/
create  index Relationship_22_FK on People (
CityID
);

/*==============================================================*/
/* Table: Users                                                 */
/*==============================================================*/
create table Users (
   UserID               SERIAL                 not null,
   UserName             VARCHAR(255)         not null,
   UserStatus           VARCHAR(30)          not null default 'Inactive'
      constraint CKC_USERSTATUS_USERS check (UserStatus in ('Inactive','Basic','Standard','Premium')),
   UserMoney            FLOAT8               not null default 0,
   UserStatusDueDate    DATE                 null,
   UserEmail            VARCHAR(255)         not null,
   UserPassword         VARCHAR(255)         not null,
   UserSpent            FLOAT8               null default 0,
   constraint PK_USERS primary key (UserID)
);

/*==============================================================*/
/* Index: Users_Email                                           */
/*==============================================================*/
create unique index Users_Email on Users (
UserEmail
);

/*==============================================================*/
/* Table: UsersFilmsLibrary                                     */
/*==============================================================*/
create table UsersFilmsLibrary (
   FilmID               INT4                 not null,
   UserID               INT4                 not null,
   DateAdd              DATE                 not null,
   DateRemove           DATE                 null,
   constraint PK_USERSFILMSLIBRARY primary key (FilmID, UserID),
   constraint FK_USERSFIL_USERSFILM_FILMS_1 foreign key (FilmID)
      references Films (FilmID)
      on delete cascade on update cascade,
   constraint FK_USERSFIL_USERSFILM_USERS_1 foreign key (UserID)
      references Users (UserID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Index: Relationship_18_FK                                    */
/*==============================================================*/
create  index Relationship_18_FK on UsersFilmsLibrary (
FilmID
);

/*==============================================================*/
/* Index: Relationship_20_FK                                    */
/*==============================================================*/
create  index Relationship_20_FK on UsersFilmsLibrary (
UserID
);

/*==============================================================*/
/* Table: UsersFilmsRatings                                     */
/*==============================================================*/
create table UsersFilmsRatings (
   UserID               INT4                 not null,
   FilmID               INT4                 not null,
   Rating               INT2                 not null,
   constraint PK_USERSFILMSRATINGS primary key (UserID, FilmID),
   constraint FK_USERSFIL_USERSFILM_USERS foreign key (UserID)
      references Users (UserID)
      on delete cascade on update cascade,
   constraint FK_USERSFIL_USERSFILM_FILMS foreign key (FilmID)
      references Films (FilmID)
      on delete cascade on update cascade
);

/*==============================================================*/
/* Index: Relationship_17_FK                                    */
/*==============================================================*/
create  index Relationship_17_FK on UsersFilmsRatings (
UserID
);

/*==============================================================*/
/* Index: Relationship_19_FK                                    */
/*==============================================================*/
create  index Relationship_19_FK on UsersFilmsRatings (
FilmID
);

