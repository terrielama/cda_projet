# python manage.py test main.security_test

from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class SecurityTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="user", password="password123")
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

    def test_access_with_valid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.get('/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_access_without_token(self):
        response = self.client.get('/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_with_invalid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + 'badtoken123')
        response = self.client.get('/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
