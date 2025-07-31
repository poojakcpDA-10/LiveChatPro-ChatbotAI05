from django.shortcuts import render
from rest_framework import viewsets
from .models import Product, Review
from .serializers import ProductSerializer, ReviewSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.generics import CreateAPIView  # Import this

from rest_framework.views import APIView  # Add this import
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model  
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer 
from django.contrib.auth.models import User

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

from django.shortcuts import render
from django.views.generic import ListView
from .models import Product

'''class ProductListView(ListView):
    model = Product
    template_name = 'store/product_list.html'  # Adjust if needed
    context_object_name = 'products' '''

class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



User = get_user_model()

# User Registration View
class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# User Login View
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "role": user.role})

        return Response({"error": "Invalid Credentials"}, status=400)
