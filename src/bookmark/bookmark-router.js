/* eslint-disable eqeqeq */
/* eslint-disable indent */
'use strict';
const express = require('express');
const xss = require('xss');
const {v4: uuid} = require('uuid');
const logger = require('../logger');
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

        for (const [key,value] of Object.entries(newBookmark)){
            if(value == null){
                logger.error(`${key} is required`);
                return res  
                        .status(400)
                        .json({error: {message: `Missing '${key}' in the request body`}});
            }
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
    .all((req,res,next) => {
        const {bookmark_id} = req.params;
        const knexInstance = req.app.get('db');

        BookmarkService.getById(knexInstance, bookmark_id)
            .then(bookmark => {
                if(!bookmark){
                    logger.error(`Bookmark with id ${bookmark_id} not found.`);
                    return res
                        .status(404)
                        .json({error: {message: 'Bookmark doesn\'t exist'}});
                }
                res.bookmark = bookmark;
                next();
            })
            .catch(next);
    })
    .get((req,res,next) => {
        res.json({
            id: res.bookmark.id,
            title: xss(res.bookmark.title),
            url: res.bookmark.url,
            description: xss(res.bookmark.description),
            rating: res.bookmark.rating,
        });
    })
    .delete((req,res,next) => {
        const {bookmark_id} = req.params;
        const knexInstance = req.app.get('db');

        BookmarkService.deleteBookmark(knexInstance, bookmark_id)
            .then(() => {
                logger.info(`List with id ${bookmark_id} deleted`);
                res.status(204).end();
            })
            .catch(next);
    });

module.exports = bookmarkRouter;