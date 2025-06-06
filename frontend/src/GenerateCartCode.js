// Le cart_code est un identifiant unique pour un panier.
//  Il permet à ton système de savoir quel panier appartient à quel utilisateur ou session, même si l'utilisateur n'est pas connecté.

// Cette fonction permet de générer une chaîne alphanumérique aléatoire de la longueur souhaitée

function generateRandomAlphanumeric(length = 10) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

export const randomValue = generateRandomAlphanumeric();

// ------ Exemple que je vais utiliser : ----------
// const cartCode = generateRandomAlphanumeric(12);
// console.log(cartCode); // Exemple : "aZ8dP9qX7Lm1"

