from rest_framework import serializers

from apps.users.models.client_health_snapshot import ClientHealthSnapshot


class ClientHealthSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientHealthSnapshot
        fields = '__all__'