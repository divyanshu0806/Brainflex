const bcrypt = require('bcryptjs')
const pool = require('../db/pool')

// PATCH /api/user/profile
async function updateProfile(req, res) {
  const { name, phone } = req.body
  const user_id = req.user.id

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' })
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = $1, phone = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, phone`,
      [name.trim(), phone || null, user_id]
    )
    res.json({ message: 'Profile updated successfully', user: result.rows[0] })
  } catch (err) {
    console.error('Update profile error:', err.message)
    res.status(500).json({ error: 'Server error updating profile' })
  }
}

// PATCH /api/user/password
async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body
  const user_id = req.user.id

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [user_id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, user_id]
    )
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error('Update password error:', err.message)
    res.status(500).json({ error: 'Server error updating password' })
  }
}

// DELETE /api/user
async function deleteAccount(req, res) {
  const user_id = req.user.id
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [user_id])
    res.json({ message: 'Account deleted successfully' })
  } catch (err) {
    console.error('Delete account error:', err.message)
    res.status(500).json({ error: 'Server error deleting account' })
  }
}

module.exports = { updateProfile, updatePassword, deleteAccount }