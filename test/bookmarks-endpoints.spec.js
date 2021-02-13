/*eslint-disable indent*/
'use strict';
const {expect} = require('chai');
const knex = require('knex');
const app = require('../src/app');
const makeBookmarksArray = require('./bookmarks.fixtures');

describe.only('Bookmark Endpoints', () => {
    let db;

    before('make knex instance', () => {
        db = knex({
            'client': 'pg',
            'connection': process.env.TEST_DB_URL,
        });
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db('blogful_articles').truncate());

    context('Given there are articles in the database', () => {
        const testBookmarks = makeBookmarksArray();

        beforeEach('insert articles', () => {
            return db   
                .into('bookmarks')
                .insert(testBookmarks);
        });
    });
});
