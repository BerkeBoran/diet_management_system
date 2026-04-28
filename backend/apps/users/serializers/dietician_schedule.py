from rest_framework import serializers

from apps.users.models.dietician import DieticianSchedule


class DieticianScheduleSerializer(serializers.Serializer):

    work_time_start = serializers.TimeField()
    work_time_end = serializers.TimeField()
    weekend_workings = serializers.BooleanField()
    weekend_work_time_start = serializers.TimeField()
    weekend_work_time_end = serializers.TimeField()
    appointment_duration = serializers.ChoiceField(choices=DieticianSchedule.AppointmentDuration.choices)


    def validate(self, attrs):
        work_time_start = attrs.get('work_time_start')
        work_time_end = attrs.get('work_time_end')
        weekend_workings = attrs.get('weekend_workings')
        weekend_work_time_start = attrs.get('weekend_work_time_start')
        weekend_work_time_end = attrs.get('weekend_work_time_end')
        appointment_duration = attrs.get('appointment_duration')

        return attrs