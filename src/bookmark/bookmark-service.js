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
    },

    getById(knex, bookmarkId){
        return knex
            .from('bookmarks')
            .select('*')
            .where('id', bookmarkId)
            .first();
    },

    deleteBookmark(knex, id){
        return knex('bookmarks')
            .where({id})
            .delete();
    },

    updateBookmark(knex, id, newBookmarkFields){
        return knex('bookmarks')
            .where({id})
            .update(newBookmarkFields);
    }
};

module.exports = BookmarkService;