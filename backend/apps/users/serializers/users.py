from rest_framework import serializers

from apps.users.models import Client, Dietician
from apps.users.serializers.review import DieticianReviewSerializer


class ClientProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Client
        fields = ('id', 'first_name', 'last_name', 'email', 'phone_number', 'allergies','weight', 'height', 'age', 'chronic_conditions')


class DieticianProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Dietician
        fields = ('id', 'first_name', 'last_name', 'email', 'phone_number', 'profile_photo', 'title')


class DieticianListSerializer(serializers.ModelSerializer):
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Dietician
        fields = ['id', 'first_name', 'last_name', 'average_rating', 'review_count', 'profile_photo','title']

class DieticianDetailSerializer(serializers.ModelSerializer):
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    reviews = DieticianReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Dietician
        fields = ['id', 'first_name', 'last_name', 'profile_photo', 'biography', 'average_rating', 'review_count', 'reviews', 'title']