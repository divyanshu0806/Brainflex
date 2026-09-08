const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db/pool')

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}

// POST /api/auth/signup
async function signup(req, res) {
  const { name, email, phone, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' })
  }

  try {
    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, created_at`,
      [name, email, phone || null, password_hash]
    )

    const user = result.rows[0]

    // Create streak record for new user
    await pool.query(
      'INSERT INTO streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [user.id]
    )

    const token = generateToken(user)

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('Signup error:', err.message)
    res.status(500).json({ error: 'Server error during signup' })
  }
}

// POST /api/auth/signin
async function signin(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = result.rows[0]
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user)

    res.json({
      message: 'Signed in successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('Signin error:', err.message)
    res.status(500).json({ error: 'Server error during signin' })
  }
}

// 🆕 ADDED: POST /api/auth/google
async function googleAuth(req, res) {
  const { idToken } = req.body

  if (!idToken) {
    return res.status(400).json({ error: 'idToken is required' })
  }

  try {
    // 1. Verify token with Google's API
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    )
    const googleUser = await response.json()

    if (!response.ok || googleUser.error) {
      return res.status(401).json({ error: 'Invalid Google token' })
    }

    // 2. Verify audience matches your Client ID
    const GOOGLE_CLIENT_ID = '127532052081-qsjo7up4sn4i5qpte7o9o7680m84r2uq.apps.googleusercontent.com'
    if (googleUser.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Token not issued for this app' })
    }

    const { sub: google_id, email, name, picture } = googleUser

    if (!email) {
      return res.status(400).json({ error: 'Could not retrieve email from Google' })
    }

    // 3. Find existing user by google_id or email
    let result = await pool.query(
      'SELECT id, name, email, google_id FROM users WHERE google_id = $1 OR email = $2',
      [google_id, email]
    )

    let user
    if (result.rows.length > 0) {
      user = result.rows[0]
      // Update google_id and avatar if account existed via standard email/pass signup
      if (!user.google_id) {
        await pool.query(
          'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3',
          [google_id, picture || null, user.id]
        )
      }
    } else {
      // Create a brand new user
      const newUser = await pool.query(
        `INSERT INTO users (name, email, google_id, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email`,
        [name || email.split('@')[0], email, google_id, picture || null]
      )
      user = newUser.rows[0]

      // Create streak record for the new user
      await pool.query(
        'INSERT INTO streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
        [user.id]
      )
    }

    // 4. Issue your application's standard JWT
    const token = generateToken(user)

    res.json({
      message: 'Signed in with Google successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('Google auth error:', err.message)
    res.status(500).json({ error: 'Server error during Google sign-in' })
  }
}

// GET /api/auth/me  (protected — returns current user from token)
async function me(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ user: result.rows[0] })
  } catch (err) {
    console.error('Me error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

// ⚠️ Remember to include googleAuth here!
module.exports = { signup, signin, googleAuth, me }