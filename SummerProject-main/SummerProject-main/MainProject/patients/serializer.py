import datetime
from datetime import timedelta
from asgiref.sync import sync_to_async
from rest_framework import serializers
from .models import SavoirUser, Patient, Allergy, PatientOtherAllergy, DrSpecialty, UserFullName, DiagnosisReservation, \
    DoctorAvailability, PtDiagnosis, Doctor, Gender, Message, PtDietPlan, DietaryPreferences


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['date_changed', 'weight', 'height']


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = ['id', 'allergy_name']


class PatientOtherAllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientOtherAllergy
        fields = ['user', 'otherAllergy']


class DrSpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = DrSpecialty
        fields = ['specialty_type']


class UserFullNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFullName
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavoirUser
        exclude = ['password']


class DiagnosisReservationSerializer(serializers.ModelSerializer):
    doctor = serializers.CharField(source='dr_user.username')
    patient = serializers.CharField(source='pt_user.username')

    class Meta:
        model = DiagnosisReservation
        fields = ['id', 'doctor', 'patient', 'reservation_date', 'is_delete']

    def to_representation(self, instance):
        # get original value
        representation = super().to_representation(instance)
        # -1 hr
        if 'reservation_date' in representation:
            original_date = instance.reservation_date
            # Adjust for server timezone offset (assuming UTC+1)
            adjusted_date = original_date - timedelta(hours=1)
            representation['reservation_date'] = adjusted_date

        return representation


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ['dr_user', 'date', 'time', 'is_available']


class PatientDataSerializer(serializers.Serializer):
    Username = serializers.CharField(max_length=150)
    Forenames = serializers.CharField(max_length=400)
    Surname = serializers.CharField(max_length=200)
    Age = serializers.IntegerField()
    Gender = serializers.CharField(max_length=30)
    Email = serializers.EmailField(max_length=255)
    Phone_Number = serializers.CharField(max_length=20)
    Avatar = serializers.CharField(max_length=300)


class DoctorProfileSerializer(serializers.Serializer):
    Username = serializers.CharField(max_length=150)
    Forenames = serializers.CharField(max_length=400)
    Surname = serializers.CharField(max_length=200)
    Gender = serializers.CharField(max_length=30)
    Email = serializers.EmailField(max_length=255)
    Phone_Number = serializers.CharField(max_length=20)
    School = serializers.CharField(max_length=200)
    Seniority = serializers.CharField(max_length=200)
    Specialty = serializers.CharField(max_length=200)
    Experience_years = serializers.IntegerField()
    Is_authenticated = serializers.BooleanField()


class DoctorProfileSerializerPatient(serializers.ModelSerializer):
    forename = serializers.SerializerMethodField()
    surname = serializers.SerializerMethodField()
    experience_years = serializers.SerializerMethodField()
    seniority = serializers.SerializerMethodField()
    school = serializers.SerializerMethodField()
    specialty = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()

    class Meta:
        model = SavoirUser
        fields = ['username', 'avatar', 'last_login', 'registration_date',
                  'forename', 'surname', 'experience_years', 'seniority', 'school', 'specialty', 'gender']

    def get_forename(self, obj):
        try:
            return obj.userfullname.forenames
        except UserFullName.DoesNotExist:
            return None

    def get_surname(self, obj):
        try:
            return obj.userfullname.surname
        except UserFullName.DoesNotExist:
            return None

    def get_experience_years(self, obj):
        try:
            return obj.doctor.experience_years
        except Doctor.DoesNotExist:
            return None

    def get_seniority(self, obj):
        try:
            return obj.doctor.seniority
        except Doctor.DoesNotExist:
            return None

    def get_school(self, obj):
        try:
            return obj.doctor.school
        except Doctor.DoesNotExist:
            return None

    def get_specialty(self, obj):
        try:
            return obj.doctor.specialty.specialty_type
        except Doctor.DoesNotExist:
            return None

    def get_gender(self, obj):
        try:
            return obj.userfullname.gender.gender_name
        except (UserFullName.DoesNotExist, Gender.DoesNotExist):
            return None


class PtDiagnosisSerializer(serializers.Serializer):
    diagnosis = serializers.CharField(max_length=150)
    generation_time = serializers.DateTimeField()
    diagnosed_dr_full_name = serializers.CharField(max_length=150)


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        fields = ['channel', 'user', 'content', 'timestamp']


class AlternativeMessageSerializer(serializers.Serializer):
    channel = serializers.IntegerField()
    user = serializers.IntegerField()
    username = serializers.CharField()
    content = serializers.CharField()
    timestamp = serializers.DateTimeField()


class PtDietPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PtDietPlan
        fields = '__all__'


class DietaryPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietaryPreferences
        fields = '__all__'

class NutritionistProfileSerializer(serializers.Serializer):
    Username = serializers.CharField(max_length=150)
    Forenames = serializers.CharField(max_length=400)
    Surname = serializers.CharField(max_length=200)
    Gender = serializers.CharField(max_length=30)
    Email = serializers.EmailField(max_length=255)
    Phone_Number = serializers.CharField(max_length=20)
    Qualification = serializers.CharField(max_length=200)
    Experience_years = serializers.IntegerField()
    Is_authenticated = serializers.BooleanField()