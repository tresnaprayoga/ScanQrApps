const CardModel = require('../src/models/card.model');
const bcrypt = require('bcrypt');
const db = require('../src/config/db');

async function runTests() {
  try {
    const cardId = 'A001';
    
    console.log('1. Testing findById (Before Activation)...');
    let card = await CardModel.findById(cardId);
    console.log(card ? `Card found: ${card.id}, status: ${card.status}` : 'Card not found');

    if (card) {
      console.log('\n2. Testing activate...');
      const pin = '1234';
      const pin_hash = await bcrypt.hash(pin, 10);
      
      await CardModel.activate(cardId, {
        business_name: 'Warung Makan Budi',
        business_address: 'Jl. Merdeka No 1',
        review_link: 'https://g.page/r/test-review',
        pin_hash
      });
      
      card = await CardModel.findById(cardId);
      console.log(`After Activation: Name: ${card.business_name}, Status: ${card.status}, ActivatedAt: ${card.activated_at}`);

      console.log('\n3. Testing verifyPin (Correct PIN)...');
      let isCorrect = await CardModel.verifyPin(cardId, '1234');
      console.log('Pin 1234 match:', isCorrect ? '✅ Success' : '❌ Failed');

      console.log('\n4. Testing verifyPin (Wrong PIN)...');
      let isWrong = await CardModel.verifyPin(cardId, '9999');
      console.log('Pin 9999 match:', isWrong ? '❌ Failed (should be false)' : '✅ Success (returned false)');

      console.log('\n5. Testing update...');
      await CardModel.update(cardId, {
        business_name: 'Warung Makan Budi & Ani',
        business_address: 'Jl. Merdeka No 123'
      });
      card = await CardModel.findById(cardId);
      console.log(`After Update: Name: ${card.business_name}, Address: ${card.business_address}`);
    }

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    // End the db connection pool so script exits
    await db.end();
  }
}

runTests();
