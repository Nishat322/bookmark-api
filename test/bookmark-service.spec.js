/* eslint-disable indent */
'use strict';
require('dotenv').config();
const { expect } = require('chai');
const knex = require('knex');
const BookmarkService = require('../src/bookmark/bookmark-service');

describe('Bookmarks service object', function(){
    let db;
    let testBookmarks = [
        {   
            id: 1,
            title: 'Thinkful',
            url: 'https://www.thinkful.com',
            description: 'Think outside the classroom',
            rating: '5' 
        },
        { 
            id: 2,
            title: 'Google',
            url: 'https://www.google.com',
            description: 'Where we find everything else',
            rating: '4' 
        },
        { 
            id: 3,
            title: 'MDN',
            url: 'https://developer.mozilla.org',
            description: 'The only place to find web documentation',
            rating: '5' 
        },
    ];

    before(() => {
        db = knex({
            'client': 'pg',
            'connection': process.env.TEST1_DB_URL,
        });
    });

    before(() => db('bookmarks').truncate());

    afterEach(() => db('bookmarks').truncate());

    after(() => db.destroy());

    context('Given \'bookmarks\' has data', () => {
        beforeEach(() => {
            return db   
                .into('bookmarks')
                .insert(testBookmarks);
        });

        it('getAllBookmarks() resolves all bookmarks from \'bookmarks\' table', () => {
            return BookmarkService.getAllBookmarks(db)
                .then(actual => {
                    expect(actual).to.eql(testBookmarks.map(bookmark => ({
                        id: bookmark.id,
                        title: bookmark.title,
                        url: bookmark.url,
                        description: bookmark.description,
                        rating: bookmark.rating
                    })));
                });
        });

        it('getById() resolves a bookmark by id from \'bookmarks\' table', () => {
            const secondId = 2;
            const secondTestBookmark = testBookmarks[secondId -1];

            return BookmarkService.getById(db, secondId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: secondId,
                        title: secondTestBookmark.title,
                        url: secondTestBookmark.url,
                        description: secondTestBookmark.description,
                        rating: secondTestBookmark.rating
                    });
                });

        });

        it('deleteBookmark() removes a bookmark by id from \'bookmarks\' table', () => {
            const bookmarkId = 2;

            return BookmarkService.deleteBookmark(db, bookmarkId)
                .then(() => BookmarkService.getAllBookmarks(db))
                .then(allBookmarks => {
                    [
                        {   
                            id: 1,
                            title: 'Thinkful',
                            url: 'https://www.thinkful.com',
                            description: 'Think outside the classroom',
                            rating: '5' 
                        },
                        { 
                            id: 3,
                            title: 'MDN',
                            url: 'https://developer.mozilla.org',
                            description: 'The only place to find web documentation',
                            rating: '5' 
                        },
                    ];
                    const expected = testBookmarks.filter(bookmark => bookmark.id !== bookmarkId);
                    expect(allBookmarks).to.eql(allBookmarks);
                });
        });
    });

    context('Given \'bookmarks\' has no data', () => {
        it('getAllBookmarks() resolves an empty array', () => {
            return BookmarkService.getAllBookmarks(db)
                .then(actual => {
                    expect(actual).to.eql([]);
                });
        });

        it('insertBookmark() inserts a new bookmark and resolves with a new bookmark with an \'id\'', () => {
            const newBookmark = {
                title: 'New test Bookmark',
                url: 'newtestbookmark.com',
                description: 'New test description',
                rating: '3'
            };

            return BookmarkService.insertBookmark(db, newBookmark)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        title: newBookmark.title,
                        url: newBookmark.url,
                        description: newBookmark.description,
                        rating: newBookmark.rating
                    });
                });

        });
    });
});

