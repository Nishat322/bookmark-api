/*eslint-disable indent*/
'use strict';

const {expect} = require('chai');
const knex = require('knex');
const app = require('../src/app');
const supertest = require('supertest');
const {makeBookmarksArray, makeMaliciousArray} = require('./bookmarks.fixtures');

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
                    .expect(404, {error: {message: 'Bookmark doesn\'t exist'}});
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

        context('Given an XSS attack bookmark', () => {
            const maliciousBookmark = makeMaliciousArray();
            
            beforeEach('insert malicious article', () => {
                return db
                    .into('bookmarks')
                    .insert([ maliciousBookmark ]);
            });
            
            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/bookmarks/${maliciousBookmark.id}`)
                    .expect(200)
                    .expect(res => {
                            expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;');
                            expect(res.body.description).to.eql('Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.');
                    });
            });
        });
    });

    describe('POST /bookmarks', () => {
        it('creates a bookmark, responding with 201 and the new bookmark', () => {
            const newBookmark = {  
                title: 'New Title',
                url: 'https://www.newbookmark.com',
                description: 'A new bookmark',
                rating: '5' 
            };

            return supertest(app)
                .post('/bookmarks')
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title);
                    expect(res.body.url).to.eql(newBookmark.url);
                    expect(res.body.description).to.eql(newBookmark.description);
                    expect(res.body.rating).to.eql(newBookmark.rating);
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .expect(postRes.body)
                );
        });

        const requiredFields = ['title', 'url', 'description', 'rating'];

        requiredFields.forEach(field => {
            const newBookmark = {  
                title: 'New Title',
                url: 'https://www.newbookmark.com',
                description: 'A new bookmark',
                rating: '5' 
            };
            

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBookmark[field];

                return supertest(app)
                    .post('/bookmarks')
                    .send(newBookmark)
                    .expect(400, {error: {message: `Missing '${field}' in the request body`}});
            });
        });
    });

    describe.only('DELETE /bookmarks/bookmark_id', () => {
        context('Given no bookmarks', () => {
            it('responds with 404', () => {
                const idToRemove = 123456;

                return supertest(app)
                    .delete(`/bookmarks/${idToRemove}`)
                    .expect(404, {error: {message: 'Bookmark doesn\'t exist'}});
            });
        });

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray();

            beforeEach('insert bookmarks', () => {
                return db 
                    .into('bookmarks')
                    .insert(testBookmarks);
            });

            it('responds with 204 an removes the bookmark', () => {
                const idToRemove = 2;
                const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove);

                return supertest(app)
                    .delete(`/bookmarks/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get('/bookmarks')
                            .expect(expectedBookmarks)
                    );
            });
        });
    });
});
