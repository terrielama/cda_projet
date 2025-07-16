# python manage.py test main.test_profile_unitaire 


from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

User = get_user_model()

class ProfileViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

    def test_profile_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        response = self.client.get('/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_profile_unauthenticated(self):
        response = self.client.get('/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
