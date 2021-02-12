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
            title: 'Thinkful',
            url: 'https://www.thinkful.com',
            description: 'Think outside the classroom',
            rating: '5' 
        },
        { 
            title: 'Google',
            url: 'https://www.google.com',
            description: 'Where we find everything else',
            rating: '4' 
        },
        { 
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

    before(() => {
        return db   
            .into('bookmarks')
            .insert(testBookmarks);
    });

    after(() => db.destroy());

    describe('getAllBookmarks', function(){
        it('resolves all bookmarks from \'bookmarks\' table', () => {
            
        });
    });
});

