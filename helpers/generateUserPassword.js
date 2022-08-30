// function to generate random password for automated user registration
function generateUserPassword() {
    const characters = '0123456789!@#$%^&*abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomPassword = '';
    for (let i = 0; i < 10; i++) {
      randomPassword += characters[Math.floor(Math.random() * characters.length)];
    }
    return randomPassword
}

  module.exports = generateUserPassword