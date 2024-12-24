from rest_framework.decorators import api_view
from django.utils import timezone
from .models import SavoirUser, Nutritionist, UserFullName, PtDietPlan, PatientBirthday, Gender, \
    PtDietPlanApproval, DietaryPreferences
from .serializer import PtDietPlanSerializer, PatientDataSerializer, NutritionistProfileSerializer
from .views import SECRET_KEY
from django.core.exceptions import ObjectDoesNotExist
import hashlib
from django.db.models import Max, Min
from datetime import datetime, timedelta, date
import jwt
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from .savoirStatus import SavoirStatus
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics
from django.shortcuts import get_object_or_404

@api_view(['Post'])
def nu_register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    phone_number = request.data.get('phone_number')
    last_login = timezone.now()
    registration_date = timezone.now()
    is_delete = 0
    is_active = 1
    is_staff = 2
    is_superuser = 0

    # fields for nutritionist table
    qualification = request.data.get("qualification")
    experience_years = request.data.get("experience_years")

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
            'exp': datetime.utcnow() + timedelta(days=1),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, SECRET_KEY)
        final_user.save()

        # nutritionist register
        new_nutritionist = Nutritionist(user=final_user,
                            qualification=qualification,
                            experience_years=experience_years,
                            is_authenticated=is_authenticated)
        new_nutritionist.save()

        new_userfullname = UserFullName(user=final_user,
                                        forenames=forenames,
                                        surname=surname)
        new_userfullname.save()

        return Response({'msg': 'success nutritionist registration', 'token': token}, status=status.HTTP_200_OK)
    return Response({'msg': 'Nutritionist has been registered'}, status=SavoirStatus.HTTP_597_UserAlreadyExist)

# approve a diet plan so that the patient can see it
@api_view(['POST'])
def approve_diet_plan(request):
    username = request.data.get('username')
    if username is not None:
        PtDietPlan.objects.filter(user__username=username).update(is_approved=True)
        PtDietPlanApproval.objects.filter(user__username=username).update(approval_status=True)
        return Response({'message': 'Diet plans approved successfully'}, status=status.HTTP_200_OK)
    return Response({'error': 'Username not provided'}, status=status.HTTP_400_BAD_REQUEST)


class DietPlanListView(generics.ListAPIView):
    serializer_class = PtDietPlanSerializer

    def get_queryset(self):
        week_num = self.request.query_params.get('week_num')
        username = self.request.query_params.get('username')

        queryset = PtDietPlan.objects.all()

        if week_num is not None:
            queryset = queryset.filter(week_num=week_num)
        
        if username is not None:
            queryset = queryset.filter(user__username=username)

        return queryset


def calculate_age(birthdate):
        today = date.today()
        age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
        return age

# for nutritionist home page getting the patients whose diet plans are remained unapproved
@api_view(['GET'])
def get_unapproved_diet_plans(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        nu_user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'msg': 'Invalid token'}, status=status.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'Unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    if nu_user.is_staff == 2:
        if not nu_user.nutritionist.is_authenticated:
            return Response({'msg': 'Only authenticated nutritionists can check patient information'}, status=status.HTTP_400_BAD_REQUEST)

    unapproved_plans = PtDietPlanApproval.objects.filter(approval_status=False)
    users = [plan.user for plan in unapproved_plans]
    unique_users = list(set(users))
    
    result_set = []
    for patient in unique_users:
        try:
            patient_dob = PatientBirthday.objects.get(user_id=patient.id)
            age = calculate_age(patient_dob.dob)
            info = UserFullName.objects.get(user_id=patient.id)
            gender = Gender.objects.get(id=info.gender_id)
            
            result_set.append({
                'Username': patient.username,
                'Forenames': info.forenames,
                'Surname': info.surname,
                'Age': age,
                'Gender': gender.gender_name,
                'Email': patient.email,
                'Phone_Number': patient.phone_number,
                'Avatar': patient.avatar
            })
        except ObjectDoesNotExist:
            continue

    paginator = PageNumberPagination()
    paginator.page_size = 5
    result_page = paginator.paginate_queryset(result_set, request)
    serializer = PatientDataSerializer(result_page, many=True)

    return paginator.get_paginated_response(serializer.data)

# return whether the diet plan of a patient is approved
@api_view(['GET'])
def get_approval_status(request):
    username = request.query_params.get('username')
    try:
        user = SavoirUser.objects.get(username=username)
        approval = PtDietPlanApproval.objects.get(user=user)
        return Response({'approval_status': approval.approval_status}, status=status.HTTP_200_OK)
    except SavoirUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except PtDietPlanApproval.DoesNotExist:
        return Response({'error': 'Approval status not found'}, status=status.HTTP_404_NOT_FOUND)

# Screen eligible patients by name, age and gender
@api_view(['POST'])
def nufind_patient(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        druser = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=False)
    except SavoirUser.DoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'msg': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
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

    approved_users = PtDietPlanApproval.objects.values_list('user', flat=True)
    patients = SavoirUser.objects.filter(id__in=approved_users, is_staff=False, is_delete=False)

    if username:
        patients = patients.filter(username__icontains=username)

    try:
        if forenames:
            patients = patients.filter(userfullname__forenames__icontains=forenames)
        if surname:
            patients = patients.filter(userfullname__surname__icontains=surname)
        if gender:
            gender_id = int(gender)
            if gender_id != -1:
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

# for nutritionists editing a patient's meal on his/her diet plan
@api_view(['POST'])
def update_meal(request):
    plan_id = request.data.get('id')
    new_meal = request.data.get('meal')

    if not plan_id or not new_meal:
        return Response({'error': 'Plan ID and new meal text must be provided'}, status=status.HTTP_400_BAD_REQUEST)

    plan = get_object_or_404(PtDietPlan, id=plan_id)
    plan.meal = new_meal
    plan.save()

    return Response({'message': 'Meal updated successfully'}, status=status.HTTP_200_OK)

# Get the user's dietary preference information based on the provided user name and return it to the client
@api_view(['GET'])
def get_dietary_preferences(request):
    username = request.query_params.get('username')
    
    try:
        user = SavoirUser.objects.get(username=username)
        dietary_preferences = DietaryPreferences.objects.get(user=user)
        
        dietary_preferences_data = {
            'vegetarian': dietary_preferences.vegetarian,
            'vegan': dietary_preferences.vegan,
            'pescatarian': dietary_preferences.pescatarian,
            'halal': dietary_preferences.halal,
            'kosher': dietary_preferences.kosher,
            'glutenFree': dietary_preferences.glutenFree,
            'lactoseFree': dietary_preferences.lactoseFree,
            'other': dietary_preferences.other,
            'otherDetails': dietary_preferences.otherDetails,
        }
        
        return Response(dietary_preferences_data, status=status.HTTP_200_OK)
    
    except SavoirUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except DietaryPreferences.DoesNotExist:
        return Response({'error': 'Dietary preferences not found'}, status=status.HTTP_404_NOT_FOUND)

# for nutritionists checking their profiles
@api_view(['get'])
def get_nutritionist_profile(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        nuuser = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError or jwt.DecodeError:
        return Response({'msg': 'Invalid token'}, status=SavoirStatus.HTTP_593_TokenNotValid)
    except Exception as e:
        return Response({'msg': 'unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_fullname = nuuser.userfullname
        gender = user_fullname.gender
    except:
        return Response({'msg': "incompleted nutritionist information"}, status=status.HTTP_400_BAD_REQUEST)

    output_data = {
        'Username': nuuser.username,
        'Forenames': user_fullname.forenames,
        'Surname': user_fullname.surname,
        'Gender': gender.gender_name,
        'Email': nuuser.email,
        'Phone_Number': nuuser.phone_number,
        'Qualification': nuuser.nutritionist.qualification,
        'Experience_years': nuuser.nutritionist.experience_years,
        'Is_authenticated': nuuser.nutritionist.is_authenticated,
    }

    serializer = NutritionistProfileSerializer(output_data)

    return Response({'nutritionist_profile': serializer.data}, status=status.HTTP_200_OK)

# for nutritionists updating their profiles
@api_view(['POST'])
def update_nutritionist_profile(request, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user = SavoirUser.objects.get(pk=payload['id'], is_staff=payload['is_staff'], is_delete=0)
        nutritionist = Nutritionist.objects.get(user=user)
    except ObjectDoesNotExist:
        return Response({'msg': 'Cannot find user by token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'msg': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'msg': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'msg': 'Unknown exception'}, status=status.HTTP_400_BAD_REQUEST)

    experience_years = request.data.get('experience_years')
    qualification = request.data.get('qualification')

    if experience_years is not None:
        nutritionist.experience_years = experience_years
    if qualification is not None:
        nutritionist.qualification = qualification

    nutritionist.save()

    return Response({'msg': 'Profile updated successfully'}, status=status.HTTP_200_OK)