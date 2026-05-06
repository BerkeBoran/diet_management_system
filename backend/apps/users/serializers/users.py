from rest_framework import serializers

from apps.users.models import Client, Dietician
from apps.users.serializers.review import DieticianReviewSerializer


class ClientProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Client
        fields = ('id', 'first_name', 'last_name', 'email', 'phone_number', 'allergies','weight', 'height', 'age', 'chronic_conditions', 'gender')


class DieticianProfileSerializer(serializers.ModelSerializer):
    appointment_duration = serializers.IntegerField(source='dietician_schedule.appointment_duration',read_only=True)
    work_time_start = serializers.TimeField(source='dietician_schedule.work_time_start',read_only=True)
    work_time_end = serializers.TimeField(source='dietician_schedule.work_time_end',read_only=True)
    weekend_workings = serializers.BooleanField(source='dietician_schedule.weekend_workings',read_only=True)
    weekend_work_time_start = serializers.TimeField(source='dietician_schedule.weekend_work_time_start',read_only=True)
    weekend_work_time_end = serializers.TimeField(source='dietician_schedule.weekend_work_time_end',read_only=True)

    class Meta:
        model = Dietician
        fields = ('id', 'first_name', 'last_name', 'biography', 'email', 'phone_number', 'profile_photo', 'title', 'appointment_duration', 'work_time_start', 'work_time_end', 'weekend_workings', 'weekend_work_time_start', 'weekend_work_time_end')


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


class ClientCompleteProfileSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=11, required=False, allow_blank=True)
    age = serializers.IntegerField(required=False)
    gender = serializers.CharField(required=False, allow_blank=True)
    height = serializers.FloatField(required=False)
    weight = serializers.FloatField(required=False)

    def update(self, instance, validated_data):
        for field in ('phone_number', 'age'):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()

        if instance.role == 'Client':
            try:
                client = instance.client
                for field in ('gender', 'height', 'weight'):
                    if field in validated_data:
                        setattr(client, field, validated_data[field])
                client.save()
            except Exception:
                pass

        return instance


class DieticianUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dietician
        fields = ['biography', 'title']
