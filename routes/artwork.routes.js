const router = require('express').Router();
const { inputArtwork,listArtwork,viewImageArt,deleteImageArt,editArtwork} = require('../controllers/artwork.controllers');
const { image } = require('../libs/multer');

router.put('/upload', image.single('imageArt'), inputArtwork);
router.get('/list', listArtwork);
router.get('/view/:fileId', viewImageArt);
router.delete('/delete/:fileId', deleteImageArt);
router.put('/edit/:fileId', editArtwork);
module.exports = router;