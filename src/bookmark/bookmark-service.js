/* eslint-disable indent */
'use strict';
const BookmarkService = {
    getAllBookmarks(knex){
        return knex.select('*').from('bookmarks');
    },

    insertBookmark(knex, newBookmark){
        return knex
            .insert(newBookmark)
            .into('bookmarks')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    }
};

module.exports = BookmarkService;