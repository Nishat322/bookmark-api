/* eslint-disable indent */
//to test bookmarksService
'use strict';
require('dotenv').config();
const knex = require('knex');
const BookmarkService = require('./bookmark-service');

const knexInstance = knex({
    'client': 'pg',
    'connection': process.env.DB_URL,
});

console.log(BookmarkService.getAllBookmarks());