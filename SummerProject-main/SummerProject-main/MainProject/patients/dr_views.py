from rest_framework.decorators import api_view
from django.utils import timezone
from .models import BowelCancerSymptom, BreastCancerSymptom, DiagnosisReservation, LungCancerSymptom, OvarianCancerSymptom, ProstateCancerSymptom, SavoirUser, Doctor, DrSpecialty, UnspecifiedSymptoms, UserFullName, Gender, PatientBirthday, \
    PtAllergy, PatientOtherAllergy, Patient, PtDiagnosis, DoctorAvailability
from django.core.exceptions import ObjectDoesNotExist
import hashlib
from django.db.models import Max, Min
from datetime import datetime, timedelta, date
import jwt
from rest_framework.response import Response
from .views import SECRET_KEY
from rest_framework import status
from .savoirStatus import SavoirStatus
from .serializer import DrSpecialtySerializer, PatientDataSerializer, DoctorProfileSerializer, PtDiagnosisSerializer, \
    DoctorAvailabilitySerializer, PatientSerializer
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination

# used to draw weight and height history
import matplotlib
import matplotlib.pyplot as plt
import io
import base64

# for doctor registration
@api_view(['Post'])
def dr_register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    phone_number = request.data.get('phone_number')
    last_login = timezone.now()
    registration_date = timezone.now()
    is_delete = 0
    is_active = 1
    is_staff = 1
    is_superuser = 0

    # fields for doctor table
    school = request.data.get("school")
    seniority = request.data.get("seniority")
    experience_years = request.data.get("experience_years")
    specialty_str = request.data.get("specialty")
    gender_str = request.data.get("gender")
    try:
        specialty = DrSpecialty.objects.get(specialty_type=specialty_str)
        gender = Gender.objects.get(gender_name=gender_str)
    except DrSpecialty.DoesNotExist:
        return Response({'msg': f'Specialty {specialty_str} does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    except Gender.DoesNotExist:
        return Response({'msg': f'Gender {gender_str} does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    is_authenticated = False

    # fields for user full name
    forenames = request.data.get("forenames")
    surname = request.data.get("surname")

    try:
        SavoirUser.objects.get(username=username)
    except ObjectDoesNotExist:
        hashed = hashlib.sha256(password.encode()).hexdigest()
        final_user = SavoirUser(username=username, email=email, phone_number=phone_number, last_login=last_login,
                                registration_date=registration_date, is_delete=is_delete,
                                is_active=is_active, is_staff=is_staff, is_superuser=is_superuser, password=hashed)

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

        # doctor register
        new_doctor = Doctor(user=final_user,
                            school=school,
                            seniority=seniority,
                            specialty=specialty,
                            experience_years=experience_years,
                            is_authenticated=is_authenticated)
        new_doctor.save()

        new_userfullname = UserFullName(user=final_user,
                                        forenames=forenames,
                                        surname=surname,
                                        gender=gender)
        new_userfullname.save()

        return Response({'msg': 'success doctor registration', 'token': token}, status=status.HTTP_200_OK)
    return Response({'msg': 'Doctor has been registered'}, status=SavoirStatus.HTTP_597_UserAlreadyExist)

# for doctor selecting specialty when registering
@api_view(['Post'])
def search_specialty(request):
    query_word = request.data.get('query_word')
    query_word = query_word.lower()
    result = DrSpecialty.objects.filter(specialty_type__contains=query_word)
    serializer = DrSpecialtySerializer(result, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# for doctor screening patients by age range, gender and name
@api_view(['POST'])
def find_patient(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        druser = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    if druser.is_staff == 1:
        if not druser.doctor.is_authenticated:
            return Response({'msg': 'only authenticated doctor can check patient information'},
                            status=status.HTTP_400_BAD_REQUEST)
    elif druser.is_staff == 2:
        if not druser.nutritionist.is_authenticated:
            return Response({'msg': 'only authenticated nutritionist can check patient information'},
                            status=status.HTTP_400_BAD_REQUEST)

    username = request.data.get('username')
    forenames = request.data.get('forenames')
    surname = request.data.get('surname')
    from_age = request.data.get('fromAge')
    to_age = request.data.get('toAge')
    gender = request.data.get('gender')

    patients = SavoirUser.objects.filter(is_staff=False, is_delete=False)

    if username:
        patients = patients.filter(username__icontains=username)

    try:
        if forenames:
            patients = patients.filter(userfullname__forenames__icontains=forenames)
        if surname:
            patients = patients.filter(userfullname__surname__icontains=surname)
        if gender:
            gender_id = int(gender)
            if (gender_id != -1):
                patients = patients.filter(userfullname__gender__id=gender_id)
    except:
        return Response({'msg': 'user full name does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if from_age and to_age:
            from_age_int = int(from_age)
            to_age_int = int(to_age)
            today = date.today()
            from_birthdate = today - timedelta(days=to_age_int * 365)
            to_birthdate = today - timedelta(days=from_age_int * 365)
            patients = patients.filter(Q(patientbirthday__dob__range=(from_birthdate, to_birthdate)))
    except ObjectDoesNotExist:
        return Response({'msg': 'patient birthday does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    except:
        return Response({'msg': 'unknown error'}, status=status.HTTP_400_BAD_REQUEST)

    output_data = []
    for patient in patients:
        # pt_user = patient.pt_user
        try:
            user_fullname = patient.userfullname
            patient_birthday = patient.patientbirthday
            gender = user_fullname.gender
        except:
            continue

        age = calculate_age(patient_birthday.dob)

        output_data.append({
            'Username': patient.username,
            'Forenames': user_fullname.forenames,
            'Surname': user_fullname.surname,
            'Age': age,
            'Gender': gender.gender_name,
            'Email': patient.email,
            'Phone_Number': patient.phone_number,
            'Avatar': patient.avatar
        })

    paginator = PageNumberPagination()
    paginator.page_size = 10
    result_page = paginator.paginate_queryset(output_data, request)
    serializer = PatientDataSerializer(result_page, many=True)

    return paginator.get_paginated_response(serializer.data)

    # return Response({'patients': output_data}, status=status.HTTP_200_OK)

# for doctor checking patients' profile
@api_view(['POST'])
def get_patient_information(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        druser = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    if druser.is_staff == 1:
        if not druser.doctor.is_authenticated:
            return Response({'msg': 'only authenticated doctor can check patient information'},
                            status=status.HTTP_400_BAD_REQUEST)
    elif druser.is_staff == 2:
        if not druser.nutritionist.is_authenticated:
            return Response({'msg': 'only authenticated nutritionist can check patient information'},
                            status=status.HTTP_400_BAD_REQUEST)

    username = request.data.get('username')
    try:
        patient = SavoirUser.objects.get(username=username, is_staff=False)
    except ObjectDoesNotExist:
        return Response({'msg': 'no such user'}, status=status.HTTP_404_NOT_FOUND)
    try:
        user_fullname = patient.userfullname
        patient_birthday = patient.patientbirthday
        gender = user_fullname.gender
    except:
        return Response({'msg': "incompleted information"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Retrieve unspecified symptoms
    try:
        unspecified_symptoms = UnspecifiedSymptoms.objects.get(user=patient)
        unspecified_data = {
            'WeightLoss': unspecified_symptoms.WeightLoss,
            'Fatigue': unspecified_symptoms.Fatigue,
            'Fever': unspecified_symptoms.Fever,
            'Pain': unspecified_symptoms.Pain,
            'SkinChanges': unspecified_symptoms.SkinChanges,
            'BowelBladderChanges': unspecified_symptoms.BowelBladderChanges,
            'BleedingBruising': unspecified_symptoms.BleedingBruising,
            'Lumps': unspecified_symptoms.Lumps,
            'Cough': unspecified_symptoms.Cough,
            'Dysphagia': unspecified_symptoms.Dysphagia,
            'Anorexia': unspecified_symptoms.Anorexia,
            'NightSweats': unspecified_symptoms.NightSweats,
            'Lymphoedema': unspecified_symptoms.Lymphoedema,
            'NeuroSymptoms': unspecified_symptoms.NeuroSymptoms,
            'AbdoPain': unspecified_symptoms.AbdoPain,
            'other_symptom': unspecified_symptoms.other_symptom,
            'generation_time': unspecified_symptoms.generation_time,
        }
    except UnspecifiedSymptoms.DoesNotExist:
        unspecified_data = "No unspecified symptoms recorded."
    
    # Initialize a dictionary to hold the results
    cancer_risks = {
        "lung_cancer": "N/A",
        "bowel_cancer": "N/A",
        "breast_cancer": "N/A",
        "ovarian_cancer": "N/A",
        "prostate_cancer": "N/A"
    }

    # Retrieve cancer risks
    try:
        lung_cancer = LungCancerSymptom.objects.get(user=patient)
        cancer_risks["lung_cancer"] = interpret_cancer_risk(lung_cancer.result)
    except LungCancerSymptom.DoesNotExist:
        pass

    try:
        bowel_cancer = BowelCancerSymptom.objects.get(user=patient)
        cancer_risks["bowel_cancer"] = interpret_cancer_risk(bowel_cancer.result)
    except BowelCancerSymptom.DoesNotExist:
        pass

    try:
        breast_cancer = BreastCancerSymptom.objects.get(user=patient)
        cancer_risks["breast_cancer"] = interpret_cancer_risk(breast_cancer.result)
    except BreastCancerSymptom.DoesNotExist:
        pass

    try:
        ovarian_cancer = OvarianCancerSymptom.objects.get(user=patient)
        cancer_risks["ovarian_cancer"] = interpret_cancer_risk(ovarian_cancer.result)
    except OvarianCancerSymptom.DoesNotExist:
        pass

    try:
        prostate_cancer = ProstateCancerSymptom.objects.get(user=patient)
        cancer_risks["prostate_cancer"] = interpret_cancer_risk(prostate_cancer.result)
    except ProstateCancerSymptom.DoesNotExist:
        pass

    ptAllergy = PtAllergy.objects.filter(user=patient)
    allergies_id = ptAllergy.values_list('allergy', flat=True)
    allergies = []
    for pta in ptAllergy:
        allergies.append(pta.allergy.allergy_name)

    try:
        ptOtherAllergy = PatientOtherAllergy.objects.get(user=patient)
        other_allergies = ptOtherAllergy.otherAllergy
    except:
        other_allergies = ''

    wh_history = Patient.objects.filter(user=patient)

    max_w = wh_history.aggregate(Max('weight'))
    min_w = wh_history.aggregate(Min('weight'))
    max_h = wh_history.aggregate(Max('height'))
    min_h = wh_history.aggregate(Min('height'))
    date = wh_history.values_list('date_changed', flat=True)
    weight = wh_history.values_list('weight', flat=True)
    height = wh_history.values_list('height', flat=True)
    chart = generate_line_chart(date, weight, height, min_w['weight__min'], max_w['weight__max'], min_h['height__min'],
                                max_h['height__max'])
    diagnosis_filter = PtDiagnosis.objects.filter(user_id=patient.id)
    new_list = []
    for item in diagnosis_filter:
        try:
            dr_full_name = UserFullName.objects.get(user_id=item.diagnosed_dr_id)
        except ObjectDoesNotExist:
            return Response(status=SavoirStatus.HTTP_598_NoSuchUser)
        new_list.append({
            'diagnosis': item.diagnosis,
            'generation_time': item.generation_time,
            'diagnosed_dr_full_name': dr_full_name.forenames + ' ' + dr_full_name.surname
        })
    diagnosis_serializer = PtDiagnosisSerializer(new_list, many=True)
    output_data = {
        'username': username,
        'forename': user_fullname.forenames,
        'surname': user_fullname.surname,
        'dob': patient_birthday.dob,
        'gender': gender.gender_name,
        'email': patient.email,
        'phone_Number': patient.phone_number,
        'allergies_id': allergies_id,
        'allergies': allergies,
        'other_allergies': other_allergies,
        'diagnosis': diagnosis_serializer.data,
        'cancer_risks': cancer_risks,
        'unspecified_symptoms': unspecified_data
    }

    if len(wh_history) < 2:
        patient_serializer = PatientSerializer(wh_history, many=True)
        return Response({'patient_information': output_data, 'data': patient_serializer.data},
                        status=status.HTTP_200_OK)

    return Response({'patient_information': output_data, 'chart': chart},
                    status=status.HTTP_200_OK)

# return height and weight chart to get_patient_information function
def generate_line_chart(x, y1, y2, min_w, max_w, min_h, max_h):
    matplotlib.use('agg')
    figure, (axe1, axe2) = plt.subplots(1, 2, figsize=(18, 12), dpi=100)
    axe1.plot(x, y1, color='red', alpha=0.3)
    axe1.set_xlabel('Time')
    axe1.set_ylabel('Weight')
    axe1.set_ylim([min_w, max_w])
    # axe1.xaxis.set_major_locator(plt.MultipleLocator(1))
    axe1.set_title('Weight Chart')

    axe2.plot(x, y2, color='blue', alpha=0.3)
    axe2.set_xlabel('Time')
    axe2.set_ylabel('Height')
    axe2.set_ylim([min_h, max_h])
    # axe2.xaxis.set_major_locator(plt.MultipleLocator(1))
    axe2.set_title('Height Chart')

    # 将图表保存到内存中
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)

    # 将图像编码为base64
    image_base64 = base64.encodebytes(buffer.getvalue()).decode('utf-8')
    buffer.close()
    # return ''
    return image_base64


def calculate_age(birthdate):
    today = date.today()
    age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    return age

# return patients registered in the last 24 hours
@api_view(['post'])
def get_pt_registered_in_days(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        druser = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    if druser.is_staff == 1:
        if not druser.doctor.is_authenticated:
            return Response({'msg': 'only authenticated doctor can check patient information'},
                            status=status.HTTP_400_BAD_REQUEST)
    elif druser.is_staff == 2:
        if not druser.nutritionist.is_authenticated:
            return Response({'msg': 'only authenticated nutritionist can check patient information'},
                            status=status.HTTP_400_BAD_REQUEST)

    one_week_ago = timezone.now() - timedelta(days=1)
    patients = SavoirUser.objects.filter(is_staff=False, registration_date__range=(one_week_ago, timezone.now()))
    result_set = []
    for patient in patients:
        patient_dob = PatientBirthday.objects.get(user_id=patient.id)
        age = calculate_age(patient_dob.dob)
        info = UserFullName.objects.get(user_id=patient.id)
        gender = Gender.objects.get(id=info.gender_id)
        result_set.append(
            {'Username': patient.username, 'Forenames': info.forenames, 'Surname': info.surname, 'Age': age,
             'Gender': gender.gender_name, 'Email': patient.email, 'Phone_Number': patient.phone_number,
             'Avatar': str(patient.avatar)})
    # serializer = PatientDataSerializer(result_set, many=True)
    # return Response(serializer.data, status=status.HTTP_200_OK)

    paginator = PageNumberPagination()
    paginator.page_size = 5
    result_page = paginator.paginate_queryset(result_set, request)
    serializer = PatientDataSerializer(result_page, many=True)

    return paginator.get_paginated_response(serializer.data)

# for doctors checking their own profiles
@api_view(['get'])
def get_doctor_profile(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        druser = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_fullname = druser.userfullname
        gender = user_fullname.gender
    except:
        return Response({'msg': "incompleted doctor information"}, status=status.HTTP_400_BAD_REQUEST)

    output_data = {
        'Username': druser.username,
        'Forenames': user_fullname.forenames,
        'Surname': user_fullname.surname,
        'Gender': gender.gender_name,
        'Email': druser.email,
        'Phone_Number': druser.phone_number,
        'School': druser.doctor.school,
        'Seniority': druser.doctor.seniority,
        'Specialty': druser.doctor.specialty,
        'Experience_years': druser.doctor.experience_years,
        'Is_authenticated': druser.doctor.is_authenticated,
    }

    serializer = DoctorProfileSerializer(output_data)

    return Response({'doctor_profile': serializer.data}, status=status.HTTP_200_OK)

# for doctors leaving diagnosis in the patient's profile
@api_view(['post'])
def save_patient_diagnosis(response, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        druser = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        diagnosis_data = response.data.get('diagnosis')
        patient_username = response.data.get('username')
        user_filter = SavoirUser.objects.get(username=patient_username)
        PtDiagnosis.objects.create(diagnosis=diagnosis_data, user_id=user_filter.id, diagnosed_dr_id=druser.id)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by username'}, status=SavoirStatus.HTTP_598_NoSuchUser)

    return Response(status=status.HTTP_200_OK)

# return the doctor's upcoming meetings sorted by reservation date
@api_view(['get'])
def get_coming_meeting(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        druser = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    reservation = DiagnosisReservation.objects.filter(
        dr_user=druser,
        reservation_date__gte=timezone.now())
    reservation = reservation.order_by('reservation_date')

    output_data = []
    for rsv in reservation:
        output_data.append({
            'patient_name': rsv.pt_user.username,
            'age': calculate_age(rsv.pt_user.patientbirthday.dob),
            'gender': rsv.pt_user.userfullname.gender.gender_name,
            'booking_time': rsv.reservation_date
        })

    return Response({'msg': 'get coming meetings successfully', 'data': output_data}, status=status.HTTP_200_OK)

# for doctors checking the available periods they set
@api_view(['get'])
def get_doctor_working_time(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        druser = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    time_set = DoctorAvailability.objects.filter(dr_user=druser)
    serializer = DoctorAvailabilitySerializer(time_set, many=True)
    return Response({'data': serializer.data}, status=status.HTTP_200_OK)

# used in message page, return the patient's information to the doctor
@api_view(['post'])
def get_patient_profile_doctor_byId(request,token):
    # check doctor's token
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

    user_id=request.data.get('id')
    try:
        patient = SavoirUser.objects.get(id=user_id, is_staff=False)
    except SavoirUser.DoesNotExist:
        return Response({'detail': 'SavoirUser not found'}, status=status.HTTP_404_NOT_FOUND)
    except Doctor.DoesNotExist:
        return Response({'detail': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    output_data={
        'username':     patient.username,
        'forename':     patient.userfullname.forenames,
        'surname' :     patient.userfullname.surname,
        'gender'  :     patient.userfullname.gender.gender_name,
        'email'   :     patient.email,
        'phone_number': patient.phone_number
    }

    return Response({'data':output_data},status=status.HTTP_200_OK)

# for doctors updating their personal information
@api_view(['POST'])
def update_doctor_profile(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
        doctor = Doctor.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'msg': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'msg': 'Unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    experience_years = request.data.get('experience_years')
    seniority = request.data.get('seniority')
    school = request.data.get('school')
    specialty_name = request.data.get('specialty')

    try:
        specialty = DrSpecialty.objects.get(specialty_type=specialty_name)
    except DrSpecialty.DoesNotExist:
        return Response({'msg': 'Specialty does not exist'}, status=status.HTTP_400_BAD_REQUEST)


    if experience_years is not None:
        doctor.experience_years = experience_years
    if seniority is not None:
        doctor.seniority = seniority
    if school is not None:
        doctor.school = school
    if specialty is not None:
        doctor.specialty = specialty

    doctor.save()

    return Response({'msg': 'Profile updated successfully'}, status=status.HTTP_200_OK)


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
