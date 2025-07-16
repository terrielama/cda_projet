from django.contrib.auth import get_user_model

def migrate_passwords_to_argon2():
    User = get_user_model()
    users = User.objects.all()
    count = 0
    for user in users:
        raw_password = None  # On ne l'a pas (par sécurité)
        if not user.password.startswith('argon2$'):
            print(f"User {user.username} n'a pas un hash Argon2.")
            print("Impossible de migrer sans le mot de passe clair.")
            print("Il faudra qu’il change son mot de passe à la prochaine connexion.")
            count += 1
    print(f"{count} utilisateurs à migrer manuellement.")
