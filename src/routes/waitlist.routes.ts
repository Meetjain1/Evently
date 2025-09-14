import { Router } from 'express';
import { WaitlistController } from '../controllers/waitlist.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import { joinWaitlistSchema } from '../validations/waitlist.validation';

const router = Router();
const waitlistController = new WaitlistController();

// Protected routes
router.post('/join', authenticate, validate(joinWaitlistSchema), waitlistController.joinWaitlist);
router.get('/user', authenticate, waitlistController.getUserWaitlistEntries);
router.get('/event/:eventId', authenticate, waitlistController.getEventWaitlist);
router.delete('/:id', authenticate, waitlistController.leaveWaitlist);
router.post('/:id/notify', authenticate, adminOnly, waitlistController.notifyWaitlistEntry);
router.post('/process/:eventId', authenticate, adminOnly, waitlistController.processWaitlist);

export default router;
