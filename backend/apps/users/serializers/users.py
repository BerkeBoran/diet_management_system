from rest_framework import serializers

from apps.users.models import Client, Dietician


class ClientProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Client
        fields = ('id', 'first_name', 'last_name', 'email', 'phone_number')


class DieticianProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Dietician
        fields = ('id', 'first_name', 'last_name', 'email', 'phone_number')
