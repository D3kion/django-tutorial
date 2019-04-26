from django.contrib.auth import authenticate, get_user_model
from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.core.exceptions import ObjectDoesNotExist
from django.template.loader import render_to_string
from django_rest_passwordreset.signals import reset_password_token_created
from rest_framework import filters, generics, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import expires_in, token_expire_handler
from .models import Capital, City, CountriesHelper, Country, Image
from .serializers import (CapitalSerializer, CityGeoSerializer, CitySerializer,
                          CountriesHelperDetailSerializer,
                          CountriesHelperSerializer, CountryGeoSerializer,
                          CountrySerializer, ImageSerializer,
                          UserRegisterSerializer, UserSigninSerializer)


#
# Auth
#
@api_view(['GET'])
def user_info(request):
    token = request.GET.get('token')

    try:
        user = get_user_model().objects.get(auth_token=token)
    except ObjectDoesNotExist:
        return Response({
            'detail': 'Token is undefined',
        }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'user': user.username,
        'isAdmin': user.is_superuser,
        'expires_in': expires_in(Token.objects.get(key=token))
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes((AllowAny,))
def signin(request):
    signin_serializer = UserSigninSerializer(data=request.data)
    if not signin_serializer.is_valid():
        return Response(signin_serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(
        username=signin_serializer.data['username'],
        password=signin_serializer.data['password'],
    )
    if not user:
        return Response({'detail': 'Invalid credentials'},
                        status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)

    is_expired, token = token_expire_handler(token)

    return Response({
        'token': token.key,
        'expires_in': expires_in(token),
    }, status=status.HTTP_200_OK)


class UserCreate(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, format='json'):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                return Response(serializer.data,
                                status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args,
                                 **kwargs):
    import socket
    url = socket.gethostbyname(socket.gethostname())
    context = {
        'username': reset_password_token.user.username,
        'token': reset_password_token.key,
        'url': f'http://{url}:8000/',
    }

    email_plaintext_message = render_to_string('email/user_reset_password.txt',
                                               context)

    msg = EmailMultiAlternatives(
        # title:
        "<ГИС Достопримечательностей> Восстановление пароля",
        # message:
        email_plaintext_message,
        # from:
        "noreply@local",
        # to:
        [reset_password_token.user.email]
    )
    msg.send()


#
# Country
#
class CountryViewSet(viewsets.ModelViewSet):
    queryset = Country.objects.all().order_by('name')
    serializer_class = CountrySerializer
    pagination_class = None
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name',)


class CountryGeoView(generics.ListAPIView):
    queryset = Country.objects.all().order_by('id')
    serializer_class = CountryGeoSerializer
    pagination_class = None


#
# City
#
class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all().order_by('country.name').order_by('name')
    serializer_class = CitySerializer
    pagination_class = None
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name',)


class CityGeoView(generics.ListAPIView):
    queryset = City.objects.all().order_by('id')
    serializer_class = CityGeoSerializer
    pagination_class = None


#
# Image
#
class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all().order_by('-id')
    serializer_class = ImageSerializer
    pagination_class = None


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
