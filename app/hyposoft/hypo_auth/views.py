from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse
from django.contrib import auth
from rest_framework import views, generics
from hyposoft.users import UserSerializer
from .serializers import LoginSerializer, UserPermSerializer
from .models import Permission

from django.conf import settings
from django.shortcuts import redirect
from django.views.generic import TemplateView
from urllib.parse import quote


class SessionView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        u = auth.get_user(request)
        if u.is_authenticated:
            user = UserSerializer(u.__dict__).data
            return JsonResponse(user)
        else:
            return HttpResponse()


class LoginView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        auth.login(request, user)
        return JsonResponse(UserSerializer(user).data)


class LogoutView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        auth.logout(request)

        if request.META.get("REMOTE_USER"): # If from shib
            return JsonResponse({ "redirectTo": "/Shibboleth.sso/Logout?return=/" })
        else:
            return JsonResponse({})
        

class ShibbolethView(TemplateView):
    authentication_classes = []
    permission_classes = []

    template_name = 'user_info.html'

    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, **kwargs):
        """Process the request."""
        next = self.request.GET.get('next', None)
        if next is not None:
            return redirect(next)
        return super().get(request)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context


class ShibbolethLoginView(TemplateView):
    authentication_classes = []
    permission_classes = []

    redirect_field_name = "target"

    def get(self, *args, **kwargs):
        # Remove session value that is forcing Shibboleth reauthentication.
        login = settings.SHIB_LOGIN_URL + \
            '?target=%s' % quote(self.request.GET.get(
                self.redirect_field_name, ''))
        return redirect(login)


class ShibbolethLogoutView(TemplateView):
    """
    Pass the user to the Shibboleth logout page.
    Some code borrowed from:
    https://github.com/stefanfoulis/django-class-based-auth-views.
    """
    authentication_classes = []
    permission_classes = []

    redirect_field_name = "target"

    def get(self, request, *args, **kwargs):
        #Log the user out.
        auth.logout(self.request)
        #Get target url in order of preference.


class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserPermSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        perms = data['user'].pop('permission')
        user = User.objects.create(
            username=data['user']['username'],
            first_name=data['user']['first_name'],
            last_name=data['user']['last_name'],
            password=data['password'],
            email=data['user']['email']
        )
        Permission.objects.create(
            user=user,
            model_perm=perms['model_perm'],
            asset_perm=perms['asset_perm'],
            power_perm=perms['power_perm'],
            audit_perm=perms['audit_perm'],
            admin_perm=perms['admin_perm'],
            site_perm=perms['site_perm']
        )
        return UserPermSerializer(user).data

class UserRetrieve(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserPermSerializer


class UserUpdate(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserPermSerializer


class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserPermSerializer


class UserDestroy(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserPermSerializer
