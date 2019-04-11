from django.contrib.auth import authenticate
from rest_framework import viewsets, generics, filters
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK,
)

from .authentication import token_expire_handler, expires_in
from .models import City, Capital, Country, CountriesHelper
from .serializers import (
    UserSigninSerializer,
    CountrySerializer, CitySerializer, CapitalSerializer,
    CountryGeoSerializer, CityGeoSerializer,
    CountryInfoSerializer, CityInfoSerializer,
    CityPUTSerializer,
    CountryInfoHelperSerializer, CityInfoHelperSerializer,
    CountriesHelperSerializer, CountriesHelperDetailSerializer,
)


#
# Auth
#
@api_view(["GET"])
def user_info(request):
    return Response({
        'user': request.user.username,
        'expires_in': expires_in(Token.objects.get(user=request.user))
    }, status=HTTP_200_OK)


@api_view(['POST'])
@permission_classes((AllowAny,))
def signin(request):
    signin_serializer = UserSigninSerializer(data=request.data)
    if not signin_serializer.is_valid():
        return Response(signin_serializer.errors, status=HTTP_400_BAD_REQUEST)

    user = authenticate(
        username=signin_serializer.data['username'],
        password=signin_serializer.data['password'],
    )
    if not user:
        return Response({'detail': 'Invalid credentials'},
                        status=HTTP_404_NOT_FOUND)

    token, _ = Token.objects.get_or_create(user=user)

    is_expired, token = token_expire_handler(token)

    return Response({
        'token': token.key,
        'expires_in': expires_in(token),
    }, status=HTTP_200_OK)


#
# Country
#
class CountryViewSet(viewsets.ModelViewSet):
    queryset = Country.objects.all().order_by('name')
    serializer_class = CountrySerializer
    pagination_class = None


class CountryGeoView(generics.ListAPIView):
    queryset = Country.objects.all().order_by('id')
    serializer_class = CountryGeoSerializer
    pagination_class = None


class CountryInfoView(generics.ListAPIView):
    queryset = Country.objects.all().order_by('name')
    serializer_class = CountryInfoSerializer
    pagination_class = None


class CountryInfoDetailView(generics.RetrieveAPIView):
    queryset = Country.objects.all()
    serializer_class = CountryInfoSerializer


class CountrySearchView(generics.ListAPIView):
    queryset = Country.objects.all().order_by('name')
    serializer_class = CountryInfoHelperSerializer
    pagination_class = None
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name',)


#
# City
#
class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all().order_by('country.name').order_by('name')
    serializer_class = CitySerializer
    pagination_class = None


class CityGeoView(generics.ListAPIView):
    queryset = City.objects.all().order_by('id')
    serializer_class = CityGeoSerializer
    pagination_class = None


class CityInfoDetailView(generics.RetrieveAPIView):
    queryset = City.objects.all()
    serializer_class = CityInfoSerializer


class CitySearchView(generics.ListAPIView):
    queryset = City.objects.all().order_by('country.name').order_by('name')
    serializer_class = CityInfoHelperSerializer
    pagination_class = None
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name',)


class CityPUTView(generics.UpdateAPIView):
    queryset = City.objects.all()
    serializer_class = CityPUTSerializer


#
# Capital
#
class CapitalViewSet(viewsets.ModelViewSet):
    queryset = Capital.objects.all().order_by('capital_of')
    serializer_class = CapitalSerializer
    pagination_class = None


#
# CountriesHelper
#
class CountriesHelperView(generics.ListCreateAPIView):
    qs1 = Country.objects.values_list('name')
    qs2 = CountriesHelper.objects.values_list('name')
    qs = qs2.difference(qs1)
    queryset = CountriesHelper.objects.filter(name__in=qs).order_by('name')
    serializer_class = CountriesHelperSerializer
    pagination_class = None


class CountriesHelperDetailView(generics.RetrieveAPIView):
    queryset = CountriesHelper.objects.all().order_by('name')
    serializer_class = CountriesHelperDetailSerializer
    pagination_class = None
