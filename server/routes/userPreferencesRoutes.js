import express from 'express';
import { 
  getUserPreferences, 
  updateUserPreferences, 
  sendTestEmail, 
  unsubscribeFromMarketing,
  testEmailConnection 
} from '../controllers/userPreferencesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user email preferences - requires authentication
router.get('/preferences/:email', authMiddleware, getUserPreferences);

// Update user email preferences - requires authentication
router.put('/preferences/:email', authMiddleware, updateUserPreferences);

// Send test email - requires authentication
router.post('/test-email/:email', authMiddleware, sendTestEmail);

// Unsubscribe from marketing emails - public endpoint for email unsubscribe links
router.post('/unsubscribe', unsubscribeFromMarketing);

// Test email service connection - requires authentication
router.get('/test-connection', authMiddleware, testEmailConnection);

export default router;