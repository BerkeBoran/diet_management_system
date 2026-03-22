from apps.diets.models.assignment import DieticianAssignment
from rest_framework import serializers

from apps.users.serializers.users import DieticianListSerializer


class DieticianAssignmentSerializer(serializers.ModelSerializer):
    dietician_detail = DieticianListSerializer(source='dietician', read_only=True)

    class Meta:
        model = DieticianAssignment
        fields = ['id', 'client_note', 'dietician', 'dietician_note', 'status', 'dietician_detail', 'created_at', 'updated_at',]
        read_only_fields = ['id', 'status', 'dietician_note', 'created_at', 'updated_at']

    def validate(self, data):
        request = self.context['request']
        dietician = data.get('dietician')

        existing = DieticianAssignment.objects.filter(
            client = request.user,
            dietician = dietician,
            status__in = ['Pending', 'Accepted',]
        ).exists()

        if existing:
            raise serializers.ValidationError('Bu diyetisyene aktif bir isteğiniz var.')

        return data



class AssignmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DieticianAssignment
        fields = ['status', 'dietician_note']

    def validate_status(self, value):
        if value not in ['Rejected', 'Accepted']:
            raise serializers.ValidationError('Geçersiz durum')
        return value



