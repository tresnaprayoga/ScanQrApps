const db = require('../config/db');
const bcrypt = require('bcrypt');

class CardModel {
  /**
   * Find a card by its ID
   * @param {string} cardId 
   * @returns {object|null}
   */
  static async findById(cardId) {
    const [rows] = await db.query('SELECT * FROM cards WHERE id = ?', [cardId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async findForRedirect(cardId) {
    const [rows] = await db.query(
      'SELECT id, status, review_link FROM cards WHERE id = ?',
      [cardId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Activate a card with business data and PIN
   * @param {string} cardId 
   * @param {object} data - { business_name, business_address, review_link, pin_hash }
   * @returns {object} result
   */
  static async activate(cardId, data) {
    const { business_name, business_address, review_link, pin_hash } = data;
    const query = `
      UPDATE cards 
      SET business_name = ?, 
          business_address = ?, 
          review_link = ?, 
          pin_hash = ?, 
          status = 'aktif', 
          activated_at = NOW() 
      WHERE id = ?
    `;
    const [result] = await db.query(query, [
      business_name || null, 
      business_address || null, 
      review_link || null, 
      pin_hash, 
      cardId
    ]);
    return result;
  }

  /**
   * Update existing active card data
   * @param {string} cardId 
   * @param {object} data - dynamic object containing fields to update
   * @returns {object} result
   */
  static async update(cardId, data) {
    const { business_name, business_address, review_link, pin_hash } = data;
    
    const fields = [];
    const values = [];
    
    if (business_name !== undefined) {
      fields.push('business_name = ?');
      values.push(business_name);
    }
    if (business_address !== undefined) {
      fields.push('business_address = ?');
      values.push(business_address);
    }
    if (review_link !== undefined) {
      fields.push('review_link = ?');
      values.push(review_link);
    }
    if (pin_hash !== undefined) {
      fields.push('pin_hash = ?');
      values.push(pin_hash);
    }

    // Nothing to update
    if (fields.length === 0) return { affectedRows: 0 };

    values.push(cardId);
    
    const query = `UPDATE cards SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await db.query(query, values);
    return result;
  }

  /**
   * Verify the PIN of a card
   * @param {string} cardId 
   * @param {string} pin - Raw pin string
   * @returns {boolean} - true if matched, false otherwise
   */
  static async verifyPin(cardId, pin) {
    const card = await this.findById(cardId);
    if (!card || !card.pin_hash) return false;
    
    const match = await bcrypt.compare(pin, card.pin_hash);
    return match;
  }
}

module.exports = CardModel;
