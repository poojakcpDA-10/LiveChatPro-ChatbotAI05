from django.db import models
#from django.contrib.auth.models import User
from django.conf import settings

class Seller(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    store_name = models.CharField(max_length=255)

class Product(models.Model):
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/')
    def __str__(self):
        return self.name

class Review(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()

from django.contrib.auth.models import AbstractUser
from django.db import models

'''class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')

    def is_seller(self):
        return self.role == 'seller'

    def is_buyer(self):
        return self.role == 'buyer' '''
class CustomUser(AbstractUser):
    is_seller = models.BooleanField(default=False)