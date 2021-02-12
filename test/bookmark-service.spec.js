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
        before(() => {
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
    });

    context('Given \'bookmarks\' has no data', () => {
        it('getAllBookmarks() resolves an empty array', () => {
            return BookmarkService.getAllBookmarks(db)
                .then(actual => {
                    expect(actual).to.eql([]);
                });
        });
    });
});

