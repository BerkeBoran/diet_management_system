from rest_framework import serializers

from apps.diets.models.assignment import DieticianAssignment
from apps.users.models import Client


class DieticianClientsSerializer(serializers.ModelSerializer):

    class Meta:
        model = DieticianAssignment
        fields = ['id', 'goal', 'dietician', 'status', 'created_at','updated_at', 'duration', 'accepted_at']
        read_only_fields = ['id', 'status','created_at', 'updated_at', 'goal', 'duration']


class DieticianClientDetailSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name',max_length=255)
    assignment_id = serializers.IntegerField(source='assignment.id', read_only=True)
    class Meta:
        model = Client
        fields = ['id', 'name', 'allergies', 'height', 'weight', 'age', 'gender', 'activity_level', 'sugar_intake', 'assignment_id']
