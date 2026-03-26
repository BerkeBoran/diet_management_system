from rest_framework import serializers

from apps.diets.models.assignment import DieticianAssignment


class DieticianClientsSerializer(serializers.ModelSerializer):

    class Meta:
        model = DieticianAssignment
        fields = ['id', 'goal', 'dietician', 'status', 'created_at','updated_at', 'duration']
        read_only_fields = ['id', 'status','created_at', 'updated_at', 'goal', 'duration']


