from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register('country', views.CountryViewSet)
router.register('city', views.CityViewSet)
router.register('capital', views.CapitalViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('rest_framework.urls', namespace='token-auth')),
    path('token-auth/', views.signin),
    path('token-info/', views.user_info),
    path('geojson/country/', views.CountryGeoView.as_view(),
         name='country-geo'),
    path('geojson/city/', views.CityGeoView.as_view(), name='city-geo'),
    path('countries/', views.CountriesHelperView.as_view(),
         name='countires-list'),
    path('countries/<int:pk>/', views.CountriesHelperDetailView.as_view(),
         name='countires-detail'),
]
