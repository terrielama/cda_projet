# python manage.py test main.test_profile_integration 


from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()

class IntegrationAuthProfileTest(APITestCase):
    def setUp(self):
        self.user_data = {
            "username": "john",
            "email": "john@example.com",
            "password": "strongpass123"
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_full_authentication_flow(self):
        # Connexion pour obtenir le token JWT
        response = self.client.post("/token/", {
            "username": self.user_data["username"],
            "password": self.user_data["password"]
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access_token = response.data["access"]

        # Accès à l’API protégée avec le token
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + access_token)
        profile_response = self.client.get("/profile/")
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["email"], self.user_data["email"])
