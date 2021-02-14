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

    afterEach('cleanup', () => db('bookmarks').truncate());

    describe('GET /bookmarks', () => {
        context('Given there are no bookmarks in the database', () => {
            it('responds with 200 and an empty array', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(200, []);
            });
        });

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray();
    
            beforeEach('insert bookmark', () => {
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
    
    describe('GET /bookmarks/bookmark_id', () => {
        context('Given there are no bookmarks in the database', () => {
            it('responds with 404', () => {
                const bookmarkId = 123456;

                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(404, {error: {message: 'Bookmark Not Found'}});
            });
        });

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray();
            beforeEach('insert bookmark', () => {
                return db   
                    .into('bookmarks')
                    .insert(testBookmarks);
            });

            it('GET /bookmarks/bookmark_id responds with 200 and the specified bookmark', () => {
                const bookmarkId = 2;
                const expectedBookmark = testBookmarks[bookmarkId -1];
        
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(200, expectedBookmark);
            });
        });
    });

    describe.only('POST /bookmarks', () => {
        it('creates a bookmark, responding with 201 and the new bookmark', () => {
            const newBookamrk = {  
                title: 'New Title',
                url: 'https://www.newbookmark.com',
                description: 'A new bookmark',
                rating: '5' 
            };

            return supertest(app)
                .post('/bookmarks')
                .send(newBookamrk)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookamrk.title);
                    expect(res.body.url).to.eql(newBookamrk.url);
                    expect(res.body.description).to.eql(newBookamrk.description);
                    expect(res.body.rating).to.eql(newBookamrk.rating);
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .expect(postRes.body)
                );
        });
    });
});
