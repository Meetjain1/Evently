import { Router } from 'express';
import { VenueController } from '../controllers/venue.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import { createVenueSchema, updateVenueSchema } from '../validations/venue.validation';

const router = Router();
const venueController = new VenueController();

// Public routes
router.get('/', venueController.getVenues);
router.get('/:id', venueController.getVenue);

// Protected routes
router.post('/', authenticate, adminOnly, validate(createVenueSchema), venueController.createVenue);
router.put('/:id', authenticate, adminOnly, validate(updateVenueSchema), venueController.updateVenue);
router.delete('/:id', authenticate, adminOnly, venueController.deleteVenue);

export default router;
