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
    .post(bodyParser, (req,res) => {
        const {title, url, description, rating} = req.body;

    if(!title){
        logger.error('Title is required');
        return res.status(400).send('Title is missing');
    }
    if(!url){
        logger.error('Url is required');
        return res.status(400).send('Url is missing');
    }

    const id = uuid();

    const bookmark = {
        id,
        title,
        url,
        description,
        rating
    };

    bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${id} created`);
    res
        .status(201)
        .location(`http://localhost:8000/bookmarks/${id}`)
        .json(bookmark);
    });

bookmarkRouter
    .route('/bookmarks/:bookmark_id')
    .get((req,res) => {
        const {bookmark_id} = req.params;
        const bookmark = bookmarks.find(bm => bm.id == bookmark_id);

        if(!bookmark){
            logger.error(`Bookmark with id ${bookmark_id} not found.`);
            return res.status(404).send('Bookmark Not Found');
        }

        res.json(bookmark);
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