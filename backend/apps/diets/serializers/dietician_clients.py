from rest_framework import serializers

from apps.diets.models.assignment import DieticianAssignment
from apps.users.models import Client


class DieticianClientsSerializer(serializers.ModelSerializer):
    goal = serializers.CharField(source='client_health_snapshot.goal',read_only=True)


    class Meta:
        model = DieticianAssignment
        fields = ['id', 'goal', 'client', 'status', 'created_at', 'updated_at', 'accepted_at']
        read_only_fields = ['id', 'status','created_at', 'updated_at', 'goal', 'duration']


class DieticianClientDetailSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name',max_length=255)
    assignment_id = serializers.IntegerField(source='assignment.id', read_only=True)
    goal = serializers.CharField(source='client_health_snapshot.goal', read_only=True)
    activity_level = serializers.CharField(source='client_health_snapshot.activity_level', read_only=True)
    sugar_intake = serializers.CharField(source='client_health_snapshot.sugar_intake', read_only=True)
    is_pregnant = serializers.BooleanField(source='client_health_snapshot.is_pregnant', read_only=True)
    is_breastfeeding = serializers.BooleanField(source='client_health_snapshot.is_breastfeeding', read_only=True)
    alcohol_use = serializers.BooleanField(source='client_health_snapshot.alcohol_use', read_only=True)
    smoking_use = serializers.BooleanField(source='client_health_snapshot.smoking_use', read_only=True)
    medications = serializers.JSONField(source='client_health_snapshot.medications', read_only=True)
    dislike_foods = serializers.JSONField(source='client_health_snapshot.dislike_foods', read_only=True)

    class Meta:
        model = Client
        fields = ['id', 'name', 'allergies', 'height', 'weight', 'age', 'gender', 'goal', 'is_pregnant', 'is_breastfeeding', 'alcohol_use', 'smoking_use', 'medications', 'dislike_foods', 'activity_level', 'sugar_intake', 'assignment_id']
