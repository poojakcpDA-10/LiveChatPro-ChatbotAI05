"""
URL configuration for marketplace project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
'''from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from store.views import ProductViewSet, ReviewViewSet
from django.conf import settings
from django.conf.urls.static import static
from . import views
# Set up the API router
router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # API endpoints for products and reviews
   s
    path('', include('marketplace.urls')),  # Recursively include itself?
    path('products/', views.ProductListView.as_view(), name='product_list'),
]

# Serve media files in development mode only
if settings.DEBUG:  # Ensure this check exists
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
'''

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from store.views import ProductViewSet, ReviewViewSet
from django.conf import settings
from django.conf.urls.static import static
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from store.views import RegisterView

# Set up the API router
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')  # Ensure this line is correct
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # API endpoints for products and reviews
    path('products/', views.ProductListView.as_view(), name='product_list'),
]

# Serve media files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.urls import path
from .views import RegisterView, LoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

from django.urls import path
from .views import ProductListView  # Ensure this view exists

urlpatterns = [
    path('api/products/', ProductListView.as_view(), name='product-list'),
]
