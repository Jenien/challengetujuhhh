const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {imagekit} = require('../libs/imagekit');
const path = require('path');

module.exports = {
  inputArtwork: async (req, res, next) => {
    try {
      let { title, description } = req.body;
      let strFile = req.file.buffer.toString('base64');

      const { url, fileId } = await imagekit.upload({
        fileName: Date.now() + path.extname(req.file.originalname),
        file: strFile,
      });

      const Artwork = await prisma.artwork.create({
        data: {
          userId: req.user.id,
          title,
          description,
          imageArt: url,
          fileId,
        }
      });

      if (!Artwork) {
        return res.status(400).json({
          status: false,
          message: 'Bad Request!',
          err: 'user id does not exist',
          data: null,
        });
      }

      return res.status(200).json({
        status: true,
        message: 'OK!',
        err: null,
        data: { Artwork },
      });
    } catch (err) {
      next(err);
    }
  },
  listArtwork: async (req, res, next) => {
    try {
      const userId = req.user.id;
  
      const userArtworkList = await prisma.artwork.findMany({
        where: {
          userId,
        }
      });
  
      return res.status(200).json({
        status: true,
        message: 'OK!',
        err: null,
        data: { artworkList: userArtworkList },
      });
    } catch (err) {
      next(err);
    }
  },
  viewImageArt : async (req, res, next) => {
    try {
      const fileId = req.params.fileId;
  
      const artwork = await prisma.artwork.findFirst({
        where: {
          fileId: fileId,
        },
        include: {
          user: true
        }
      });
  
      if (!artwork) {
        return res.status(404).json({
          status: false,
          message: 'Artwork not found',
          data: null
        });
      }
  
      return res.status(200).json({
        status: true,
        message: 'Success',
        data: artwork
      });
    } catch (error) {
      next(error);
    }
  },
  deleteImageArt: async (req, res, next) => {
    try {
      const fileId = req.params.fileId;
  
      const existingArtwork = await prisma.artwork.findFirst({
        where: {
          fileId: fileId,
        },
        include: {
          user: true, 
        },
      });
  
      if (!existingArtwork) {
        return res.status(404).json({
          status: false,
          message: 'Artwork not found',
          data: null,
        });
      }
  
      await imagekit.deleteFile(fileId);
  
      const deletedArtwork = await prisma.artwork.delete({
        where: {
          id: existingArtwork.id, 
        },
      });
  
      return res.status(200).json({
        status: true,
        message: 'OK!',
        data: { deletedArtwork },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error',
        data: null,
      });
    }
  },
  editArtwork: async (req, res, next) => {
    try {
      const fileId = req.params.fileId;
      const { title, description } = req.body;
  
      const existingArtwork = await prisma.artwork.findFirst({
        where: {
          fileId: fileId,
        },
      });
  
      if (!existingArtwork) {
        return res.status(404).json({
          status: false,
          message: 'Artwork not found',
          data: null,
        });
      }
  
      const updatedArtwork = await prisma.artwork.update({
        where: {
          id: existingArtwork.id,
        },
        data: {
          title: title || existingArtwork.title,
          description: description || existingArtwork.description,
        },
      });
  
      return res.status(200).json({
        status: true,
        message: 'OK!',
        data: { updatedArtwork },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error',
        data: null,
      });
    }
  },  
};  