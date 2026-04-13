from django.utils import timezone

from apps.diets.models.assignment import DieticianAssignment
from rest_framework import serializers

from apps.users.serializers.users import DieticianListSerializer


class DieticianAssignmentSerializer(serializers.ModelSerializer):
    dietician_detail = DieticianListSerializer(source='dietician', read_only=True)
    goal = serializers.CharField(source='client_health_snapshot.goal',read_only=True)
    activity_level = serializers.CharField(source='client_health_snapshot.activity_level',read_only=True)
    sugar_intake = serializers.CharField(source='client_health_snapshot.sugar_intake',read_only=True)
    is_pregnant = serializers.BooleanField(source='client_health_snapshot.is_pregnant',read_only=True)
    is_breastfeeding = serializers.BooleanField(source='client_health_snapshot.is_breastfeeding',read_only=True)
    alcohol_use = serializers.BooleanField(source='client_health_snapshot.alcohol_use',read_only=True)
    smoking_use = serializers.BooleanField(source='client_health_snapshot.smoking_use',read_only=True)
    medications = serializers.JSONField(source='client_health_snapshot.medications',read_only=True)
    dislike_foods = serializers.JSONField(source='client_health_snapshot.dislike_foods',read_only=True)

    class Meta:
        model = DieticianAssignment
        fields = ['id', 'client_note', 'dietician', 'dietician_note', 'status', 'dietician_detail', 'created_at', 'updated_at','verification_status',
                  'duration', 'accepted_at', 'goal', 'activity_level', 'sugar_intake', 'is_pregnant', 'is_breastfeeding', 'alcohol_use', 'smoking_use', 'medications', 'dislike_foods']
        read_only_fields = ['id', 'status', 'dietician_note', 'created_at', 'updated_at']

    def validate(self, data):
        request = self.context['request']
        dietician = data.get('dietician')

        existing = DieticianAssignment.objects.filter(
            client = request.user,
            dietician = dietician,
            verification_status__in = ['Pending', 'Accepted',]

        ).exists()

        if existing:
            raise serializers.ValidationError('Bu diyetisyene aktif bir isteğiniz var.')

        return data



class AssignmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DieticianAssignment
        fields = ['verification_status', 'dietician_note']


    def validate_verification_status(self, value):
        if value not in ['Rejected', 'Accepted']:
            raise serializers.ValidationError('Geçersiz durum')
        return value

    def update(self, instance, validated_data):
        verification_status = validated_data.get('verification_status', instance.verification_status)
        if verification_status == DieticianAssignment.VerificationStatus.ACCEPTED:
            instance.status = DieticianAssignment.Status.INPROGRESS
            instance.accepted_at = timezone.now()

        if verification_status == DieticianAssignment.VerificationStatus.PENDING:
            instance.status = DieticianAssignment.Status.PENDING
            instance.accepted_at = None

        if verification_status == DieticianAssignment.VerificationStatus.REJECTED:
            instance.status = None
            instance.accepted_at = None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


