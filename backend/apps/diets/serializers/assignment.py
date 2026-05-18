from django.utils import timezone

from apps.diets.models.assignment import DieticianAssignment
from rest_framework import serializers

from apps.users.models import Client
from apps.users.serializers.users import DieticianListSerializer

class ClientDetailAssignmentSerializer(serializers.ModelSerializer):
    health_snapshot = serializers.SerializerMethodField()


    class Meta:
        model = Client
        fields = ['id', 'first_name', 'last_name', 'health_snapshot']


    def get_health_snapshot(self, obj):
        snapshot = obj.client_health_snapshots.order_by('-id').first()
        if snapshot:
            return {
                'goal': snapshot.goal,
                'activity_level': snapshot.activity_level,
                'sugar_intake': snapshot.sugar_intake,
                'dietary_preference': snapshot.dietary_preference,
                'is_pregnant': snapshot.is_pregnant,
                'is_breastfeeding': snapshot.is_breastfeeding,
                'alcohol_use': snapshot.alcohol_use,
                'smoking_use': snapshot.smoking_use,
                'medications': snapshot.medications,
                'dislike_foods': snapshot.dislike_foods,
            }
        return None

class DieticianAssignmentSerializer(serializers.ModelSerializer):
    dietician_detail = DieticianListSerializer(source='dietician', read_only=True)
    client_detail = ClientDetailAssignmentSerializer(source='client', read_only=True)

    class Meta:
        model = DieticianAssignment
        fields = ['id','client_detail', 'client_note', 'dietician', 'dietician_note', 'status', 'dietician_detail', 'created_at', 'updated_at','status',
                  'duration', 'accepted_at', 'agreed_monthly_price']
        read_only_fields = ['id', 'status', 'dietician_note', 'created_at', 'updated_at', 'agreed_monthly_price']

    def validate(self, data):
        request = self.context['request']
        dietician = data.get('dietician')

        existing = DieticianAssignment.objects.filter(
            client = request.user,
            dietician = dietician,
            status__in = ['Pending', 'Canceled', 'Ended']

        ).exists()

        if existing:
            raise serializers.ValidationError('Bu diyetisyene aktif bir isteğiniz var.')

        return data

    def create(self, validated_data):
        dietician = validated_data.get('dietician')
        schedule = getattr(dietician, 'dietician_schedule', None)
        if schedule and schedule.monthly_price:
            validated_data['agreed_monthly_price'] = schedule.monthly_price
        return super().create(validated_data)



class AssignmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DieticianAssignment
        fields = ['status', 'dietician_note']


    def validate_verification_status(self, value):
        if value not in ['Rejected', 'Accepted']:
            raise serializers.ValidationError('Geçersiz durum')
        return value

    def update(self, instance, validated_data):
        verification_status = validated_data.get('verification_status', instance.status)
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


