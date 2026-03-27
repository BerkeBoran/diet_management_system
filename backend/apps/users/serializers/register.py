from rest_framework import serializers
from apps.users.models import User, Client, Dietician


class ClientRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = Client
        fields = ('id', 'phone_number', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'gender', 'weight', 'height', 'age', 'chronic_conditions')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Şifreler eşleşmiyor")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        client = Client(**validated_data)
        client.set_password(password)
        client.save()
        return client


class DieticianRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = Dietician
        fields = ['id', 'phone_number', 'email', 'first_name', 'last_name', 'tc_no', 'license_number', 'age', 'license_document', 'biography', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Şifreler eşleşmiyor")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        dietician = Dietician(**validated_data)
        dietician.set_password(password)
        dietician.is_active = True
        dietician.save()
        return dietician