from datetime import date

from rest_framework import serializers

from apps.appointments.models.dietician_unavailability import DieticianUnavailability


class DieticianUnavailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DieticianUnavailability
        fields = ['id','date', 'start_time', 'end_time', 'reason', 'is_full_day', ]
        read_only_fields = ['created_at']


    def validate(self, attrs):
        selected_date = attrs.get('date')
        is_full_day = attrs.get('is_full_day', False)
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')

        if selected_date < date.today():
            raise serializers.ValidationError({
                'date': 'Seçilen gün geçmişte olamaz.'
            })

        if not is_full_day:
            if not start_time or not end_time:
                raise serializers.ValidationError({
                    'start_time': 'Tam gün kapalı değilse başlangıç ve bitiş saati zorunludur.'
                })
            if start_time >= end_time:
                raise serializers.ValidationError({
                    'end_time': 'Bitiş saati başlangıç saatinden sonra olmalıdır.'
                })

        dietician = self.context['request'].user.dietician
        overlap_qs = DieticianUnavailability.objects.filter(
            dietician=dietician,
            date=selected_date,
        )

        if self.instance:
            overlap_qs = overlap_qs.exclude(pk=self.instance.pk)

        if not is_full_day and start_time and end_time:
            overlap_qs = overlap_qs.filter(
                start_time__lt=end_time,
                end_time__gt=start_time,
            )

        if overlap_qs.exists():
            raise serializers.ValidationError({
                'date': 'Bu tarihte çakışan bir kapatma kaydı zaten mevcut.'
            })

        return attrs