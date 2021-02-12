# Bookmark API

An api for bookmarks

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Run migrations `npm run migrate`

Seed the database `psql -U Nishat -d bookmarks-f ./seeds/seed.bookmarks.sql`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's main branch.