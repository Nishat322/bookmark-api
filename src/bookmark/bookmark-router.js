/* eslint-disable eqeqeq */
/* eslint-disable indent */
'use strict';
const express = require('express');
const {v4: uuid} = require('uuid');
const logger = require('../logger');
const bookmarks = require('../store.js');
const BookmarkService = require('./bookmark-service');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
    .route('/bookmarks')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');
        BookmarkService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks);
            })
            .catch(next);
    })
    .post(bodyParser, (req,res,next) => {
        const {title, url, description, rating} = req.body;
        const newBookmark = {title, url, description, rating};
        const knexInstance = req.app.get('db');

        if(!newBookmark.title){
            logger.error('Title is required');
            return res.status(400).json('Title is missing');
        }
        if(!newBookmark.url){
            logger.error('Url is required');
            return res.status(400).json('Url is missing');
        }

        BookmarkService.insertBookmark(knexInstance, newBookmark)
            .then(bookmark => {
                logger.info(`Bookmark with id ${bookmark.id} created`);
                res
                    .status(201)
                    .location(`/bookmarks/${bookmark.id}`)
                    .json(bookmark);
            })
            .catch(next);
    });

bookmarkRouter
    .route('/bookmarks/:bookmark_id')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');
        const {bookmark_id} = req.params;

        BookmarkService.getById(knexInstance, bookmark_id)
            .then(bookmark => {
                if(!bookmark){
                    logger.error(`Bookmark with id ${bookmark_id} not found.`);
                    return res
                        .status(404)
                        .json({error: {message: 'Bookmark Not Found'}});
                }
                res.json(bookmark);
            })
            .catch(next);
    })
    .delete((req,res) => {
        const {bookmark_id} = req.params;
        const listIndex = bookmarks.findIndex(bm => bm.id == bookmark_id);

        if(listIndex === -1){
            logger.error(`Bookmark with id ${bookmark_id}.`);
            return res 
                .status(404)
                .send('Not Found');
        }

        bookmarks.splice(listIndex, 1);

        logger.info(`List with id ${bookmark_id} deleted`);
        res 
            .status(204)
            .end();
    });

module.exports = bookmarkRouter;

/* Logger Logic
 * get(/bookmarks/bookmark_id)
 *      if(!bookmark_){
            logger.error(`Bookmark with id ${bookmark_id} not found.`);
            return res.status(404).send('Bookmark Not Found');
        }
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */