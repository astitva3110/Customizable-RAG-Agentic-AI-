from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission
from django.db import models


class UserManager(BaseUserManager):
    """Custom User Manager that uses email as the unique identifier"""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")

        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        docs = models.JSONField(default=list, blank=True)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model using email instead of username"""

    username = None  # Remove username field
    email = models.EmailField(unique=True)

    profile_images = models.JSONField(default=list, blank=True)
    docs = models.JSONField(default=list, blank=True)

    groups = models.ManyToManyField(
        Group, related_name="custom_user_groups", blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission, related_name="custom_user_permissions", blank=True
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
