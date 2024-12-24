import numpy as np
import tzlocal
from asgiref.sync import sync_to_async
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view
from django.db.models import Max
from .models import SavoirUser, Patient, PatientBirthday, Allergy, PtAllergy, PatientOtherAllergy, UserFullName, \
    DiagnosisReservation, Doctor, DoctorAvailability, PtDietPlan, PtDiagnosis, PtDietRequirement, Gender, ChatChannel, \
    Message, Feedback, LungCancerSymptom, UnspecifiedSymptoms, PtDietPlanApproval, BowelCancerSymptom, \
    BreastCancerSymptom, OvarianCancerSymptom, ProstateCancerSymptom, DietaryPreferences
from .serializer import UserSerializer, PatientSerializer, AllergySerializer, PatientOtherAllergySerializer, \
    UserFullNameSerializer, DiagnosisReservationSerializer, DoctorAvailabilitySerializer, PtDiagnosisSerializer, \
    DoctorProfileSerializer, DoctorProfileSerializerPatient, \
    MessageSerializer, AlternativeMessageSerializer, DietaryPreferencesSerializer
from django.utils import timezone
import hashlib
from .savoirStatus import SavoirStatus
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.validators import EmailValidator
import jwt
from datetime import datetime, timedelta, date, time
from django.db import transaction, IntegrityError
import json, re
from .ml_models import model, scaler, bowel_scaler, bowel_model, breast_scaler, breast_model, ovarian_scaler, \
    ovarian_model, prostate_scaler, prostate_model
import pytz
from .models import PtExercisePlan
from django.http import JsonResponse

# Define a secret key for JWT encoding/decoding
SECRET_KEY = 'savoir_secrete_key_aksbfsDbvkdfj3f74fh8wjdishf8'


# Register a new patient
@api_view(['POST'])
def pt_register(request):

    # Retrieve necessary data from the request
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    phone_number = request.data.get('phone_number')
    dob = request.data.get('birthday')
    forenames = request.data.get('forenames')
    surname = request.data.get('surname')
    sex = request.data.get('gender')
    last_login = timezone.now()
    registration_date = timezone.now()
    is_delete = 0
    is_active = 1
    is_staff = 0
    is_superuser = 0

    if sex == "male":
        sex_id = 2
    elif sex == "female":
        sex_id = 3
    elif sex == "other":
        sex_id = 4
    else:
        sex_id = 5

    # Retrieve the Gender instance based on the gender ID
    gender_instance = Gender.objects.get(id=sex_id)

    if not username or not password or not email or not phone_number or not dob or not forenames or not surname:
        return Response({'msg': 'No required data'}, status=status.HTTP_400_BAD_REQUEST)

    validator = EmailValidator()
    try:
        validator(email)
    except ValidationError:
        return Response({'msg': 'invalid email format'}, status=status.HTTP_400_BAD_REQUEST)

    pattern = re.compile(r'^\d+$')
    if not pattern.match(phone_number):
        return Response({'msg': 'invalid phone number format'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Check if the username is already taken
        SavoirUser.objects.get(username=username)
    except ObjectDoesNotExist:
        # If the user does not exist, hash the password and create a new user
        hashed = hashlib.sha256(password.encode()).hexdigest()
        final_user = SavoirUser(
            username=username, email=email, phone_number=phone_number, last_login=last_login,
            registration_date=registration_date, is_delete=is_delete, is_active=is_active,
            is_staff=is_staff, is_superuser=is_superuser, password=hashed
        )
        try:
            with transaction.atomic():
                max_id = SavoirUser.objects.aggregate(max_id=Max('id'))['max_id']
                payload = {
                    'id': max_id + 1,
                    'username': username,
                    'email': email,
                    'phone_numer': phone_number,
                    'is_staff': is_staff,
                    'exp': datetime.utcnow() + timedelta(days=1),
                    'iat': datetime.utcnow()
                }
                token = jwt.encode(payload, SECRET_KEY)
                final_user.save()

                # Create and save related PatientBirthday and UserFullName records
                final_patient_birthday = PatientBirthday(user_id=final_user.id, dob=dob)
                final_patient_birthday.save()
                final_user_fullname = UserFullName(user_id=final_user.id, forenames=forenames, surname=surname,
                                                   gender=gender_instance)
                final_user_fullname.save()
        except Exception as e:
            return Response({'msg': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'msg': 'success registration', 'token': token}, status=status.HTTP_200_OK)

    # If the user already exists, return a conflict response
    return Response({'msg': 'User has been registered'}, status=status.HTTP_409_CONFLICT)

# return data required for the user's profile
@api_view(['GET'])
def user_profile(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    user_serializer = UserSerializer(user)
    return Response({**user_serializer.data}, status=status.HTTP_200_OK)


@api_view(['Post'])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    isStaff = request.data.get('isStaff')
    if not username or not password:
        return Response({'msg': 'Need more data'}, status=status.HTTP_400_BAD_REQUEST)
    
    # encode the password given by front end
    hashedPsw = hashlib.sha256(password.encode()).hexdigest()
    try:
        user = SavoirUser.objects.get(username=username, is_delete=False)
        # check if the user is one of the staff
        if isStaff == 0 and user.is_staff != isStaff:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if isStaff == 1 and user.is_staff == 0:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    except ObjectDoesNotExist:
        return Response({'message': 'user not exist'}, status=SavoirStatus.HTTP_598_NoSuchUser)

    # compare the given password to the password in our database
    if user.password != hashedPsw:
        return Response({'message': "Password incorrect"}, status=SavoirStatus.HTTP_599_PasswordNotCorrect)
    user.last_login = date.today()
    user.save()
    payload = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'phone_numer': user.phone_number,
        'is_staff': user.is_staff,
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow()
    }

    # encode a token for the user to store the information locally
    token = jwt.encode(payload, SECRET_KEY)
    return Response({'token': token, 'isStaff': user.is_staff}, status=200)


class UserViewSet(viewsets.ModelViewSet):
    queryset = SavoirUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def profile(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

# api for patients to add height and weight records
@api_view(['POST'])
def patient_add_record(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except (jwt.InvalidTokenError, jwt.DecodeError):
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'Unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    weight = request.data.get('weight')
    height = request.data.get('height')
    if not weight or not height:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    final_patient = Patient(user=user, weight=weight, height=height)
    final_patient.save()

    return Response(status=status.HTTP_200_OK)

# display height and weight records in patient side
@api_view(['GET'])
def user_height_weight_history(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Get all Patient objects associated with the current user
        patient_records = Patient.objects.filter(user_id=user.id)
        serializer = PatientSerializer(patient_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'msg': e}, status=status.HTTP_400_BAD_REQUEST)

# for patients updating contacts in their profiles
@api_view(['Post'])
def update_contact(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    email = request.data.get('email')
    phone_number = request.data.get('phone_number')

    validator = EmailValidator()
    try:
        validator(email)
    except ValidationError:
        return Response({'msg': 'invalid email format'}, status=status.HTTP_400_BAD_REQUEST)

    pattern = re.compile(r'^\d+$')
    if not pattern.match(phone_number):
        return Response({'msg': 'invalid phone number format'}, status=status.HTTP_401_BAD_REQUEST)

    if email:
        user.email = email
    if phone_number:
        user.phone_number = phone_number

    user.save()

    return Response({'msg': 'Contact information updated successfully'}, status=status.HTTP_200_OK)

# for patients selecting allergies by what they type in the box
@api_view(['Post'])
def search_allergy(request):
    query_word = request.data.get('query_word')
    query_word = query_word.lower()
    result = Allergy.objects.filter(allergy_name__contains=query_word)
    serializer = AllergySerializer(result, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# for patients adding their allergies in the profiles
@api_view(['POST'])
def add_patient_allergy(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'Unknown exception: ' + str(e)}, status=status.HTTP_400_BAD_REQUEST)

    allergy_id = request.data.get('allergy')
    if not allergy_id:
        return Response({'msg': 'Allergy ID not provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        allergy = Allergy.objects.get(pk=allergy_id)
    except Allergy.DoesNotExist:
        return Response({'msg': 'No such allergy'}, status=status.HTTP_400_BAD_REQUEST)

    # check if the allergy exists in the profile
    try:
        existing_allergy = PtAllergy.objects.filter(user_id=user.id, allergy_id=allergy_id)
        if existing_allergy.exists():
            return Response({'msg': 'The allergy has already been recorded'}, status=status.HTTP_400_BAD_REQUEST)

        new_allergy_pair = PtAllergy(user_id=user.id, allergy_id=allergy_id)
        new_allergy_pair.save()
        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'msg': 'Error adding allergy: ' + str(e)}, status=status.HTTP_400_BAD_REQUEST)

# get patients' allergies when displaying their profiles
@api_view(['GET'])
def get_patient_allergies(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    allergies = PtAllergy.objects.filter(user_id=user.id)
    other_allergies = PatientOtherAllergy.objects.filter(user_id=user.id)
    allergy_ids = [allergy.allergy_id for allergy in allergies]
    allergy_names = Allergy.objects.filter(id__in=allergy_ids).values_list('allergy_name', flat=True)

    other_allergy_serializer = PatientOtherAllergySerializer(other_allergies, many=True)

    return Response({
        'allergies': list(allergy_names),  # Convert queryset to list if necessary
        'other_allergies': other_allergy_serializer.data
    }, status=status.HTTP_200_OK)

# for patients adding allergies that does not exist in our given allergy lists
@api_view(['POST'])
def add_patient_other_allergy(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    data = {
        'user': user.id,
        'otherAllergy': request.data.get('other_allergy')
    }
    serializer = PatientOtherAllergySerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# for users changing their fullnames
@api_view(['POST'])
def store_user_name(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        forenames = request.data.get('forenames')
        surname = request.data.get('surname')

        if not forenames or not surname:
            return Response({'msg': 'Forenames and surname are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if an existing name entry exists for the user and delete it
        try:
            existing_name = UserFullName.objects.get(user=user)
            existing_name.delete()
        except UserFullName.DoesNotExist:
            pass

        # Save the new name
        data = {
            'user': user.id,
            'forenames': forenames,
            'surname': surname
        }
        serializer = UserFullNameSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_name(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        patient_name = UserFullName.objects.get(user_id=user.id)
    except ObjectDoesNotExist:
        return Response({'msg': 'No name entry found for user'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserFullNameSerializer(patient_name)
    return Response(serializer.data, status=status.HTTP_200_OK)

# get patients' birthday
@api_view(['GET'])
def get_patient_dob(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'msg': 'Unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        patient_birthday = PatientBirthday.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response({'msg': 'No birthday entry found for user'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'dob': patient_birthday.dob}, status=status.HTTP_200_OK)

# for patients making appointments
@api_view(['POST'])
def add_appointment(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        pt_user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except (jwt.InvalidTokenError, jwt.DecodeError):
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'Unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    dr_user_id = request.data.get("dr_user_id")
    reservation_date_str = request.data.get("reservation_date")

    if not dr_user_id or not reservation_date_str:
        return Response({'msg': 'Doctor ID and reservation date are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        dr_user = get_object_or_404(SavoirUser, pk=dr_user_id)
        reservation_date = parse_datetime(reservation_date_str)
        if not reservation_date:
            raise ValueError
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find the doctor'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError:
        return Response({'msg': 'Invalid reservation date format'}, status=status.HTTP_400_BAD_REQUEST)

    # local_tz = tzlocal.get_localzone()
    # local_time = reservation_date.astimezone(local_tz)
    # Adjust for server timezone offset (assuming UTC+1)
    local_time = reservation_date + timedelta(hours=1)
    new_reservation = DiagnosisReservation(
        pt_user=pt_user,
        dr_user=dr_user,
        reservation_date=local_time  # Save in UTC
    )

    # check if this time is in availability of the doctor
    try:
        DoctorAvailability.objects.get(dr_user=dr_user, is_available=True, time=local_time.time())
    except ObjectDoesNotExist:
        return Response({'msg': 'cannot reserve in this time'}, status=status.HTTP_404_NOT_FOUND)
    # check if the time is off for the doctor

    off_filter = DoctorAvailability.objects.filter(dr_user=dr_user, is_available=False,
                                                   date=local_time.date(),
                                                   time=local_time.time())
    if off_filter:  # the time is not free for the dr
        return Response({'msg': 'cannot reserve in this time'}, status=status.HTTP_400_BAD_REQUEST)

    new_reservation.save()
    return Response({'msg': 'Reservation done'}, status=status.HTTP_200_OK)

# for Cancellation of appointment by both the patient and the doctor
@api_view(['POST'])
def cancel_appointment(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except (jwt.InvalidTokenError, jwt.DecodeError):
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'Unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    appointment_id = request.data.get('appointment_id')
    if not appointment_id:
        return Response({'msg': 'Appointment ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        appointment = DiagnosisReservation.objects.get(pk=appointment_id)
        # Ensure either the patient or the doctor is the one requesting the cancellation
        if appointment.pt_user != user and appointment.dr_user != user:
            return Response({'msg': 'You do not have permission to cancel this appointment'},
                            status=status.HTTP_403_FORBIDDEN)

        appointment.delete()
        return Response({'msg': 'Appointment canceled successfully'}, status=status.HTTP_200_OK)

    except ObjectDoesNotExist:
        return Response({'msg': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'msg': 'Error canceling appointment'}, status=status.HTTP_400_BAD_REQUEST)

# return all doctors' available periods
@api_view(['POST'])
def find_available_booking(request):
    datetime_str = request.data.get('date')
    try:
        date = parse_datetime(datetime_str).date()
    except ValueError:
        return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
    result_set = []
    doctors = Doctor.objects.filter(is_authenticated=True, user__is_delete=False)

    for doctor in doctors:
        available_times = DoctorAvailability.objects.filter(
            dr_user=doctor.user,
            is_available=True
        ).values_list('time', flat=True)

        available_time_set = []
        for item in available_times:
            result_time = date.__str__() + ' ' + str(item)
            # time formatting
            time_obj = datetime.strptime(result_time, "%Y-%m-%d %H:%M:%S")

            # check if the time period has been reserved
            filter_result = DiagnosisReservation.objects.filter(dr_user=doctor.user, reservation_date=time_obj)
            if filter_result.count() == 0:
                available_time_set.append(item)

        userFullName = UserFullName.objects.get(user=doctor.user)
        result_set.append({
            'dr_id': doctor.user_id,
            'dr_name': userFullName.forenames,
            'specialty': doctor.specialty.specialty_type,
            'available_time': available_time_set,
            'avatar': str(doctor.user.avatar)
        })
    return Response(result_set, status=status.HTTP_200_OK)

# return the patient's appointments
@api_view(['GET'])
def patient_appointments(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    appointments = DiagnosisReservation.objects.filter(pt_user=user, is_delete=False)
    serializer = DiagnosisReservationSerializer(appointments, many=True)
    return Response(serializer.data)

# return the doctor's appointments
@api_view(['GET'])
def doctor_appointments(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    appointments = DiagnosisReservation.objects.filter(dr_user=user, is_delete=False).select_related('pt_user')
    serializer = DiagnosisReservationSerializer(appointments, many=True)
    return Response(serializer.data)

# for doctor adding available periods for patients to book
@api_view(['POST'])
def add_availability(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        dr_user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    availableTime = request.data.get('availableTime')

    query_set = DoctorAvailability.objects.filter(dr_user=dr_user, is_available=True)
    try:
        with transaction.atomic():
            if query_set:
                query_set.delete()
            for singleTime in availableTime:
                DoctorAvailability.objects.create(dr_user=dr_user, time=time(singleTime), is_available=True)
    except Exception as e:
        return Response({'msg': e}, status=status.HTTP_400_BAD_REQUEST)

    return Response(status=status.HTTP_200_OK)

# return the patien's diet plan
@api_view(['Get'])
def get_diet_plan(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        patient = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    diagnosis_filter = PtDiagnosis.objects.filter(user_id=patient.id)
    if not diagnosis_filter:
        return Response({'msg': 'no diagnosis yet', 'diet_status': 0}, status=SavoirStatus.HTTP_594_NoSuchThing)

    diet_filter = PtDietPlan.objects.filter(user_id=patient.id)
    if not diet_filter:
        return Response({'msg': 'no diet plan', 'diet_status': 1}, status=SavoirStatus.HTTP_594_NoSuchThing)
    if not diet_filter[0].is_approved:
        return Response({'msg': 'diet plan not approved', 'diet_status': 2},
                        status=SavoirStatus.HTTP_595_RequestNotApproved)

    return Response({'msg': 'diet plan approved', 'diet_status': 3}, status=status.HTTP_200_OK)

# for patients getting their profiles
@api_view(['GET'])
def get_patient_profile(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        patient = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_fullname = patient.userfullname
        patient_birthday = patient.patientbirthday
        gender = user_fullname.gender
    except:
        return Response({'msg': "incompleted information"}, status=status.HTTP_400_BAD_REQUEST)

    ptAllergy = PtAllergy.objects.filter(user=patient)
    allergies_id = ptAllergy.values_list('allergy', flat=True)
    allergies = []
    for pta in ptAllergy:
        allergies.append(pta.allergy.allergy_name)

    try:
        ptOtherAllergy = PatientOtherAllergy.objects.get(user=patient)
        other_allergies = ptOtherAllergy.otherAllergy
    except:
        other_allergies = []

    wh_history = Patient.objects.filter(user=patient)
    wh_history_list = []
    for wh in wh_history:
        wh_history_list.append({
            'weight': wh.weight,
            'height': wh.height,
            'date_changed': wh.date_changed,
        })

    diagnosis_filter = PtDiagnosis.objects.filter(user_id=patient.id)
    new_list = []
    for item in diagnosis_filter:
        try:
            dr_full_name = UserFullName.objects.get(user_id=item.user_id)
        except ObjectDoesNotExist:
            return Response(status=SavoirStatus.HTTP_598_NoSuchUser)
        new_list.append({
            'diagnosis': item.diagnosis,
            'generation_time': item.generation_time,
            'diagnosed_dr_full_name': dr_full_name.forenames + ' ' + dr_full_name.surname
        })
    diagnosis_serializer = PtDiagnosisSerializer(new_list, many=True)

    output_data = {
        'username': patient.username,
        'forename': user_fullname.forenames,
        'surname': user_fullname.surname,
        'dob': patient_birthday.dob,
        'gender': gender.gender_name,
        'email': patient.email,
        'phone_Number': patient.phone_number,
        'allergies_id': allergies_id,
        'allergies': allergies,
        'other_allergies': other_allergies,
        'wh_history': wh_history_list,
        'diagnosis': diagnosis_serializer.data
    }

    return Response({'patient_profile': output_data},
                    status=status.HTTP_200_OK)

# for patients to save their diet plans
@api_view(['post'])
def save_diet_plan(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        patient = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    data = []
    json_data = request.data.get('dietPlansJson')
    diet_requirement = request.data.get('dietReq')
    try:
        for item in json_data:
            data.append(json.loads(item))

    except json.JSONDecodeError:
        pass

    dietPlanHis = PtDietPlan.objects.filter(user=patient)

    if not dietPlanHis:
        dataToDietPlan(patient, data, diet_requirement)
        PtDietPlanApproval.objects.create(user=patient, approval_status=False)
        return Response({'msg': 'diet plan generated'}, status=status.HTTP_200_OK)
    else:
        # if there are existing diet plan, check if it is generated within the last 30 days
        if (calculate_day_gap(dietPlanHis[0].generated_time, timezone.now()) <= 30):
            # if it is generated within the last 30 days, refuse to save new diet plan.
            return Response({'msg': 'diet plan already exists'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # if it is not generated within the last 30 days, save new diet plan.
            for dph in dietPlanHis:
                dph.delete()
            dataToDietPlan(patient, data, diet_requirement)
            PtDietPlanApproval.objects.create(user=patient, approval_status=False)

    return Response({'msg': 'diet plan updated'}, status=status.HTTP_200_OK)

# function to parse the json data and save it into database
def dataToDietPlan(patient, data, diet_requirement):
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    meals = ['Breakfast', 'Snack1', 'Lunch', 'Snack2', 'Dinner']
    requirement = ''

    if diet_requirement['vegetarian']:
        requirement += 'vegetarian '
    if diet_requirement['vegan']:
        requirement += 'vegan '
    if diet_requirement['pescatarian']:
        requirement += 'pescatarian '
    if diet_requirement['halal']:
        requirement += 'halal '
    if diet_requirement['kosher']:
        requirement += 'kosher '
    if diet_requirement['glutenFree']:
        requirement += 'glutenFree '
    if diet_requirement['lactoseFree']:
        requirement += 'lactoseFree '
    if diet_requirement['other']:
        requirement += diet_requirement['otherDetails']

    requirement = requirement.strip()

    try:
        diet_req, created = PtDietRequirement.objects.get_or_create(
            user=patient,
            defaults={'requirement': requirement}
        )
        if not created:
            diet_req.requirement = requirement
            diet_req.save()
    except IntegrityError as e:
        return Response({"error": "Failed to save diet requirement due to a database error."}, status=500)

    gen_time = datetime.now()
    for week_num in range(len(data)):
        for day_num, day in enumerate(days):
            for meal_num, meal in enumerate(meals):
                meal_key = meal if meal not in ['Snack1', 'Snack2'] else 'Snack'
                meal_key = meal_key.lower().capitalize()
                meal_data = data[week_num].get(day, {}).get(meal_key, "")
                if meal_data:
                    PtDietPlan.objects.create(
                        user=patient,
                        week_num=week_num,
                        day_num=day_num,
                        meal_num=meal_num,
                        meal=meal_data,
                        generated_time=gen_time,
                        is_approved=False
                    )
    return


def dataToExercisePlan(patient, data):
    """Save exercise plans to the database."""

    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    gen_time = datetime.now()
    for week_num in range(len(data)):
        for day_num, day in enumerate(days):
            day_data = data[week_num].get(day, {})
            for exercise_num, exercise in enumerate(day_data):
                PtExercisePlan.objects.create(
                    user=patient,
                    week_num=week_num,
                    day_num=day_num,
                    exercise=exercise,
                    generated_time=gen_time,
                    is_approved=False
                )

    return


def calculate_day_gap(date, now):
    diff = now - date
    return diff.days

# return users' appointments
@api_view(['get'])
def get_user_appointments(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    if user.is_staff == 0:  # patient user
        appointments = DiagnosisReservation.objects.filter(pt_user=user, is_delete=False).select_related('dr_user')
    else:
        appointments = DiagnosisReservation.objects.filter(dr_user=user, is_delete=False).select_related('pt_user')

    serializer = DiagnosisReservationSerializer(appointments, many=True)
    return Response(serializer.data)

# return channel id for messaging
@api_view(['post'])
def get_channel_id(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    target_id = request.data.get('target_id')
    if user.is_staff == 0:
        channel = ChatChannel.objects.filter(pt_user=user, staff_user_id=target_id).first()
    else:
        channel = ChatChannel.objects.filter(pt_user_id=target_id, staff_user=user).first()
    if not channel:
        if user.is_staff == 0:
            channel = ChatChannel.objects.create(pt_user=user, staff_user_id=target_id)
        else:
            channel = ChatChannel.objects.create(pt_user_id=target_id, staff_user=user)

    return Response({'channel_id': channel.id}, status=status.HTTP_200_OK)

# through particular channel id get messages from a target contactor
@api_view(['post'])
def get_target_message(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    channel_id = request.data.get('channel_id')
    if not channel_id:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    messages = Message.objects.filter(channel_id=channel_id)
    result_set = []
    for message in messages:
        object_get = UserFullName.objects.get(user=message.user)
        result_set.append({
            'channel': message.channel.id,
            'user': message.user.id,
            'username': object_get.forenames + ' ' + object_get.surname,
            'content': message.content,
            'timestamp': message.timestamp
        })
    serializer = AlternativeMessageSerializer(result_set, many=True)
    return Response({'messages': serializer.data}, status=status.HTTP_200_OK)

# return existing conversations on the message page
@api_view(['post'])
def get_contactors(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    if user.is_staff == 0:
        objects_filter = ChatChannel.objects.filter(pt_user=user)
    else:
        objects_filter = ChatChannel.objects.filter(staff_user=user)
    return_obj = []
    for item in objects_filter:
        if user.is_staff == 0:
            user_full_name = UserFullName.objects.get(user=item.staff_user)
        else:
            user_full_name = UserFullName.objects.get(user=item.pt_user)
        first_msg = Message.objects.filter(channel=item).last()
        return_obj.append({
            'channel_id': item.id,
            'target_id': item.staff_user.id,
            'target_forename': user_full_name.forenames,
            'target_surname': user_full_name.surname,
            'last_message': first_msg.content,
            'last_timestamp': first_msg.timestamp
        })
        return Response({'data': return_obj}, status=status.HTTP_200_OK)

# return channel id for messaging
@api_view(['post'])
def get_channel_id(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    target_id = request.data.get('target_id')
    if user.is_staff == 0:
        channel = ChatChannel.objects.get(pt_user=user, staff_user_id=target_id)
    else:
        channel = ChatChannel.objects.get(pt_user_id=target_id, staff_user=user)
    if not channel:
        if user.is_staff == 0:
            channel = ChatChannel.objects.create(pt_user=user, staff_user_id=target_id)
        else:
            channel = ChatChannel.objects.create(pt_user_id=target_id, staff_user=user)
    try:
        target_user = SavoirUser.objects.get(pk=target_id)
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    return Response({'channel_id': channel.id, 'avatar': str(target_user.avatar)}, status=status.HTTP_200_OK)


@api_view(['post'])
def get_contactors(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)
    if user.is_staff == 0:
        objects_filter = ChatChannel.objects.filter(pt_user=user)
    else:
        objects_filter = ChatChannel.objects.filter(staff_user=user)
    return_obj = []
    for item in objects_filter:
        if user.is_staff == 0:
            user_full_name = UserFullName.objects.get(user=item.staff_user)
            target_user = item.staff_user
        else:
            user_full_name = UserFullName.objects.get(user=item.pt_user)
            target_user = item.pt_user
        first_msg = Message.objects.filter(channel=item).last()
        if not first_msg:
            return_obj.append({
                'channel_id': item.id,
                'target_id': user_full_name.user.id,
                'target_forename': user_full_name.forenames,
                'target_surname': user_full_name.surname,
                'last_message': '',
                'last_timestamp': item.generation_time,
                'avatar': str(target_user.avatar)
            })
        else:
            return_obj.append({
                'channel_id': item.id,
                'target_id': user_full_name.user.id,
                'target_forename': user_full_name.forenames,
                'target_surname': user_full_name.surname,
                'last_message': first_msg.content,
                'last_timestamp': first_msg.timestamp,
                'avatar': str(target_user.avatar)
            })
    return Response({'data': return_obj}, status=status.HTTP_200_OK)

# for patients checking a doctor's profile
@api_view(['GET'])
def get_doctor_profile_patient(request, username, token):
    # check patient's token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        doctor = SavoirUser.objects.select_related('doctor', 'userfullname', 'doctor__specialty',
                                                   'userfullname__gender').get(username=username, is_staff=True)
        serializer = DoctorProfileSerializerPatient(doctor)
        return Response(serializer.data)
    except SavoirUser.DoesNotExist:
        return Response({'detail': 'SavoirUser not found'}, status=status.HTTP_404_NOT_FOUND)
    except Doctor.DoesNotExist:
        return Response({'detail': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# for patients selecting their gender when registering
@api_view(['get'])
def search_gender(request):
    output_data = []

    genders = Gender.objects.all()
    for gender in genders:
        output_data.append(gender.gender_name)
    return Response({'data': output_data}, status=status.HTTP_200_OK)

# The function of this function is to create or obtain a chat channel between the user and the target user based on the user's identity (patient or staff) and return the channel ID.
@api_view(['post'])
def start_contact_user(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)
    target_username = request.data.get('target_username')
    target_user = SavoirUser.objects.get(username=target_username)
    if not user:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if user.is_staff == 0:
        channel = ChatChannel.objects.get_or_create(pt_user=user, staff_user=target_user)
    else:
        channel = ChatChannel.objects.get_or_create(pt_user=target_user, staff_user=user)
    return Response({'channel': channel[0].id}, status=status.HTTP_200_OK)


@api_view(['post'])
def give_feedback(request):
    email = request.data.get('email')
    content = request.data.get('content')

    new_feedback = Feedback(
        email=email,
        content=content,
    )
    new_feedback.save()

    return Response({'msg': 'give feedback successfully'}, status=status.HTTP_200_OK)

# call our AI model and predict lung cancer risk
@api_view(['post'])
def get_lung_cancer_answers(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)
    answer_list = request.data.get('answer')
    user_input = np.array(answer_list).reshape(1, -1)
    user_input = scaler.transform(user_input)
    prediction_level = model.predict(user_input)
    risk_level = ["Low", "Medium", "High"]
    if len(answer_list) != 23:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    LungCancerSymptom.objects.update_or_create(user_id=user.id,
                                               defaults={'Q1': answer_list[0], 'Q2': answer_list[1],
                                                         'Q3': answer_list[2], 'Q4': answer_list[3],
                                                         'Q5': answer_list[4],
                                                         'Q6': answer_list[5], 'Q7': answer_list[6],
                                                         'Q8': answer_list[7], 'Q9': answer_list[8],
                                                         'Q10': answer_list[9], 'Q11': answer_list[10],
                                                         'Q12': answer_list[11], 'Q13': answer_list[12],
                                                         'Q14': answer_list[13],
                                                         'Q15': answer_list[14], 'Q16': answer_list[15],
                                                         'Q17': answer_list[16],
                                                         'Q18': answer_list[17], 'Q19': answer_list[18],
                                                         'Q20': answer_list[19],
                                                         'Q21': answer_list[20], 'Q22': answer_list[21],
                                                         'Q23': answer_list[22],
                                                         'result': prediction_level,
                                                         'generation_time': timezone.now()})

    return Response({'level': risk_level[prediction_level[0]]}, status=status.HTTP_200_OK)

# Records or updates a list of unspecified symptoms and other related information reported by the user and saves it to a database.
@api_view(['post'])
def add_unspecified_symptoms(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)
    answer_list = request.data.get('selectedSymptoms')
    other_info = request.data.get('otherInfo')
    new_list = []
    for i in range(15):
        if list(answer_list).__contains__(i):
            new_list.append(1)
        else:
            new_list.append(0)
    UnspecifiedSymptoms.objects.update_or_create(user=user, defaults={
        'WeightLoss': new_list[0], 'Fatigue': new_list[1], 'Fever': new_list[2], 'Pain': new_list[3], 'SkinChanges': new_list[4],
        'BowelBladderChanges': new_list[5], 'BleedingBruising': new_list[6], 'Lumps': new_list[7], 'Cough': new_list[8], 'Dysphagia': new_list[9],
        'Anorexia': new_list[10], 'NightSweats': new_list[11], 'Lymphoedema': new_list[12], 'NeuroSymptoms': new_list[13], 'AbdoPain': new_list[14],
        'other_symptom': other_info, 'generation_time': timezone.now()
    })

    return Response(status=status.HTTP_200_OK)

# change the user's avatar
@api_view(['post'])
def add_avatar(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    url = request.data.get('avatar')
    if not url:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    user.avatar = url
    user.save()
    return Response(status=status.HTTP_200_OK)

# return the user's avatar
@api_view(['get'])
def get_avatar(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'avatar': str(user.avatar)}, status=status.HTTP_200_OK)

# call our AI model and predict bowel cancer risk
@api_view(['post'])
def get_bowel_cancer_answers(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    answer_list = request.data.get('answer')
    user_input = np.array(answer_list).reshape(1, -1)
    user_input = bowel_scaler.transform(user_input)
    prediction_level = bowel_model.predict(user_input)
    risk_level = ["Low", "Medium", "High"]
    if len(answer_list) != 18:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    BowelCancerSymptom.objects.update_or_create(user_id=user.id,
                                                defaults={'Q1': answer_list[0], 'Q2': answer_list[1],
                                                          'Q3': answer_list[2], 'Q4': answer_list[3],
                                                          'Q5': answer_list[4],
                                                          'Q6': answer_list[5], 'Q7': answer_list[6],
                                                          'Q8': answer_list[7], 'Q9': answer_list[8],
                                                          'Q10': answer_list[9], 'Q11': answer_list[10],
                                                          'Q12': answer_list[11], 'Q13': answer_list[12],
                                                          'Q14': answer_list[13],
                                                          'Q15': answer_list[14], 'Q16': answer_list[15],
                                                          'Q17': answer_list[16],
                                                          'Q18': answer_list[17],
                                                          'result': prediction_level,
                                                          'generation_time': timezone.now()})

    return Response({'level': risk_level[prediction_level[0]]}, status=status.HTTP_200_OK)

# return the doctor's profile to the patient on the message page
@api_view(['post'])
def get_doctor_profile_patient_byId(request, token):
    # check patient's token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    user_id = request.data.get('id')
    try:
        doctor = SavoirUser.objects.select_related('doctor', 'userfullname', 'doctor__specialty',
                                                   'userfullname__gender').get(id=user_id, is_staff=True)
        serializer = DoctorProfileSerializerPatient(doctor)
        return Response(serializer.data)
    except SavoirUser.DoesNotExist:
        return Response({'detail': 'SavoirUser not found'}, status=status.HTTP_404_NOT_FOUND)
    except Doctor.DoesNotExist:
        return Response({'detail': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# return the patient's exercise plan
@api_view(['GET'])
def get_exercise_plan(request, token):
    try:
        # Decode the token and get the patient
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        patient = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except (jwt.InvalidTokenError, jwt.DecodeError):
        return Response({'msg': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'msg': f'Unknown exception: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Fetch exercise plans
        exercise_filter = PtExercisePlan.objects.filter(user=patient)

        if not exercise_filter.exists():
            return Response({'msg': 'No exercise plan yet', 'exercise_status': 0}, status=status.HTTP_404_NOT_FOUND)

        # Check approval status
        # approved_plans = exercise_filter.filter(is_approved=True)
        # if not approved_plans.exists():
        # return Response({'msg': 'Exercise plan not approved', 'exercise_status': 1}, status=status.HTTP_400_BAD_REQUEST)

        # Return the exercise plan data
        exercise_data = list(exercise_filter.values())
        return Response({'msg': 'Exercise plan found', 'exercise_status': 2, 'data': exercise_data},
                        status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'msg': f'Error retrieving exercise plans: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# get the patient's exercise plan and save it in the database
@api_view(['POST'])
def save_exercise_plan(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        patient = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'msg': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'msg': 'Unknown exception: ' + str(e)}, status=status.HTTP_400_BAD_REQUEST)

    try:
        data = request.data.get('exercisePlansJson', [])
        if not isinstance(data, list):
            raise ValueError('Invalid JSON format: Expected a list')
    except (json.JSONDecodeError, ValueError) as e:
        return Response({'msg': f'Invalid JSON format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    # Clear previous exercise plans if necessary
    PtExercisePlan.objects.filter(user=patient).delete()

    # Process each week's exercise plan
    for week_num, week_data in enumerate(data):
        for day, exercise in week_data.items():
            if exercise:
                # Map day to the corresponding integer (e.g., Monday=0, Sunday=6)
                day_num = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].index(day)
                PtExercisePlan.objects.create(
                    user=patient,
                    week_num=week_num,
                    day_num=day_num,
                    exercise=exercise
                )

    return Response({'msg': 'Exercise plan updated'}, status=status.HTTP_200_OK)

# call our AI model and predict breast cancer risk
@api_view(['post'])
def get_breast_cancer_answer(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    answer_list = request.data.get('answer')
    user_input = np.array(answer_list).reshape(1, -1)
    user_input = breast_scaler.transform(user_input)
    prediction_level = breast_model.predict(user_input)
    risk_level = ["Low", "Medium", "High"]
    if len(answer_list) != 16:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    BreastCancerSymptom.objects.update_or_create(user_id=user.id,
                                                 defaults={'Q1': answer_list[0], 'Q2': answer_list[1],
                                                           'Q3': answer_list[2], 'Q4': answer_list[3],
                                                           'Q5': answer_list[4],
                                                           'Q6': answer_list[5], 'Q7': answer_list[6],
                                                           'Q8': answer_list[7], 'Q9': answer_list[8],
                                                           'Q10': answer_list[9], 'Q11': answer_list[10],
                                                           'Q12': answer_list[11], 'Q13': answer_list[12],
                                                           'Q14': answer_list[13],
                                                           'Q15': answer_list[14], 'Q16': answer_list[15],
                                                           'result': prediction_level,
                                                           'generation_time': timezone.now()})

    return Response({'level': risk_level[prediction_level[0]]}, status=status.HTTP_200_OK)

# return the user's fullname
def get_user_full_name(request, username):
    try:
        user_full_name = UserFullName.objects.get(user__username=username)
        initials = user_full_name.forenames[0] + '.'
        full_name = f'{initials} {user_full_name.surname}'
        response_data = {
            'full_name': full_name
        }
        return JsonResponse(response_data)
    except UserFullName.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

# call our AI model and predict ovarian cancer risk
@api_view(['post'])
def get_ovarian_cancer_answer(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    answer_list = request.data.get('answer')
    user_input = np.array(answer_list).reshape(1, -1)
    user_input = ovarian_scaler.transform(user_input)
    prediction_level = ovarian_model.predict(user_input)
    risk_level = ["Low", "Medium", "High"]
    if len(answer_list) != 17:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    OvarianCancerSymptom.objects.update_or_create(user_id=user.id,
                                                  defaults={'Q1': answer_list[0], 'Q2': answer_list[1],
                                                            'Q3': answer_list[2], 'Q4': answer_list[3],
                                                            'Q5': answer_list[4],
                                                            'Q6': answer_list[5], 'Q7': answer_list[6],
                                                            'Q8': answer_list[7], 'Q9': answer_list[8],
                                                            'Q10': answer_list[9], 'Q11': answer_list[10],
                                                            'Q12': answer_list[11], 'Q13': answer_list[12],
                                                            'Q14': answer_list[13],
                                                            'Q15': answer_list[14], 'Q16': answer_list[15],
                                                            'Q17': answer_list[15],
                                                            'result': prediction_level,
                                                            'generation_time': timezone.now()})

    return Response({'level': risk_level[prediction_level[0]]}, status=status.HTTP_200_OK)

# call our AI model and predict prostate cancer risk
@api_view(['post'])
def get_prostate_cancer_answer(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    answer_list = request.data.get('answer')
    user_input = np.array(answer_list).reshape(1, -1)
    user_input = prostate_scaler.transform(user_input)
    prediction_level = prostate_model.predict(user_input)
    risk_level = ["Low", "Medium", "High"]
    if len(answer_list) != 16:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    ProstateCancerSymptom.objects.update_or_create(user_id=user.id,
                                                   defaults={'Q1': answer_list[0], 'Q2': answer_list[1],
                                                             'Q3': answer_list[2], 'Q4': answer_list[3],
                                                             'Q5': answer_list[4],
                                                             'Q6': answer_list[5], 'Q7': answer_list[6],
                                                             'Q8': answer_list[7], 'Q9': answer_list[8],
                                                             'Q10': answer_list[9], 'Q11': answer_list[10],
                                                             'Q12': answer_list[11], 'Q13': answer_list[12],
                                                             'Q14': answer_list[13],
                                                             'Q15': answer_list[14], 'Q16': answer_list[15],
                                                             'result': prediction_level,
                                                             'generation_time': timezone.now()})

    return Response({'level': risk_level[prediction_level[0]]}, status=status.HTTP_200_OK)
  
# Save or update the patient's dietary preferences and return the saved preference data.
@api_view(['POST'])
def save_dietary_preferences(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'msg': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'msg': 'Unknown exception', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data

    defaults = {
        'vegetarian': data.get('vegetarian'),
        'vegan': data.get('vegan'),
        'pescatarian': data.get('pescatarian'),
        'halal': data.get('halal'),
        'kosher': data.get('kosher'),
        'glutenFree': data.get('glutenFree'),
        'lactoseFree': data.get('lactoseFree'),
        'other': data.get('other'),
        'otherDetails': data.get('otherDetails'),
        'createdAt': timezone.now()
    }

    try:
        preferences, created = DietaryPreferences.objects.update_or_create(
            user=user,
            defaults=defaults
        )
        serializer = DietaryPreferencesSerializer(preferences)
        return Response({'msg': 'Dietary preferences saved', 'data': serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'msg': 'Error saving dietary preferences', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    
def interpret_cancer_risk(result):
    """
    Interprets the numeric cancer risk result.
    """
    risk_levels = {
        0: "Low",
        1: "Medium",
        2: "High"
    }
    return risk_levels.get(result, "N/A")