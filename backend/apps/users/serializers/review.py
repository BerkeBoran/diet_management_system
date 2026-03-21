from rest_framework import serializers

from apps.diets.models.assignment import DieticianAssignment
from apps.users.models.review import DieticianReview


class DieticianReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    class Meta:
        model = DieticianReview
        fields = ['id', 'client_name', 'raiting', 'comment', 'created_at']
        read_only_fields = ['id', 'client_name', 'created_at']

    def validate_raiting(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Puan 1 ile 5 arasında olmalıdır.')
        return value

class CreateDieticianReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = DieticianReview
        fields = ['raiting', 'comment']

    def validate(self, data):
        request = self.context('request')
        dietician = self.context.get('dietician')

        has_worked = DieticianAssignment.objects.filter(
            client = request.user,
            dietician = dietician,
            status = 'Ended'
        ).exists()

        if not has_worked:
            raise serializers.ValidationError(
                'Daha önce çalıştığınız bir diyetisyeni değerlendirebilirsiniz. Diyetiniz devam ediyorsa bittikten sonra puanlama yapabilirsiniz.'
            )

        if DieticianReview.objects.filter(
            client = request.user,
            dietician = dietician,
        ).exists():
            raise serializers.ValidationError('Bu diyetisyeni zaten değerlendirdiniz.')
        return data

    def create(self, validated_data):
        return DieticianReview.objects.create(
            client = self.context['request'].user,
            dietician = self.context['dietician'],
            **validated_data)
