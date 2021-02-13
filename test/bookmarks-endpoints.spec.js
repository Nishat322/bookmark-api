/*eslint-disable indent*/
'use strict';

const {expect} = require('chai');
const knex = require('knex');
const app = require('../src/app');
const supertest = require('supertest');
const {makeBookmarksArray} = require('./bookmarks.fixtures');

describe.only('Bookmark Endpoints', () => {
    let db;

    before('make knex instance', () => {
        db = knex({
            'client': 'pg',
            'connection': process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db('bookmarks').truncate());

    context('Given there are articles in the database', () => {
        const testBookmarks = makeBookmarksArray();

        beforeEach('insert articles', () => {
            return db   
                .into('bookmarks')
                .insert(testBookmarks);
        });

        it('GET /bookmarks responds with 200 and all the bookmarks', () => {
            return supertest(app)
                .get('/bookmarks')
                .expect(200, testBookmarks);
        });
    });
});
