const express = require('express');
const router = express.Router();
const Instagram = require('node-instagram').default;
const {clientId,clientSecret} = require('../keys').instagram;

const instagram = new Instagram({
    clientId : clientId,
    clientSecret:clientSecret
});

router.get('/', (req,res) => {
    res.render('index');
})

const redirectURL = 'http://localhost:3000/handleauth';

router.get('/auth/instagram', (req,res) => {
    res.redirect(
        instagram.getAuthorizationUrl(redirectURL,{
            scope: ['basic','likes'],
            state: 'your state'
        })
    )
})

router.get('/handleauth', async (req,res) => {
    const code = req.query.code;
    const data = await instagram.authorizeUser(code,redirectURL);
    req.session.access_token = data.access_token;
    req.session.user_id = data.id;
    instagram.config.accessToken = req.session.access_token;
    res.redirect('/profile');
})

router.get('/login', (req,res) => {
    res.redirect('/auth/instagram');
})

router.get('/profile', async (req,res) => {
    try {
        const profileData = await instagram.get('users/self');
        const media =  await instagram.get('users/self/media/recent');
        console.log(profileData);
        res.render('profile', {user : profileData.data, posts: media.data});   
    } catch (error) {
        
    }
})

router.get('/logout', (req,res) => {
    delete req.session.access_token;
    delete req.session.user_id;
    res.redirect('/')
})


module.exports = router;