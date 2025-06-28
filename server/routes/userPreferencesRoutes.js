import express from 'express';
import { 
  getUserPreferences, 
  updateUserPreferences, 
  sendTestEmail, 
  unsubscribeFromMarketing,
  testEmailConnection 
} from '../controllers/userPreferencesController.js';

const router = express.Router();

// Get user email preferences
router.get('/preferences/:email', getUserPreferences);

// Update user email preferences
router.put('/preferences/:email', updateUserPreferences);

// Send test email
router.post('/test-email/:email', sendTestEmail);

// Unsubscribe from marketing emails
router.post('/unsubscribe', unsubscribeFromMarketing);

// Test email service connection
router.get('/test-connection', testEmailConnection);

export default router;