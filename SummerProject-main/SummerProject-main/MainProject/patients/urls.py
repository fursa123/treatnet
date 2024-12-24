from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import UserViewSet, user_profile, user_login, patient_add_record, user_height_weight_history, \
    search_allergy, update_contact, add_patient_allergy, get_patient_allergies, add_patient_other_allergy, \
    find_available_booking, store_user_name, get_user_name, add_appointment, patient_appointments, add_availability, \
    doctor_appointments, get_diet_plan, get_patient_profile, save_diet_plan, pt_register, get_user_appointments, \
    get_doctor_profile_patient, search_gender, get_channel_id, get_target_message, get_contactors, start_contact_user, \
    give_feedback, get_lung_cancer_answers, add_unspecified_symptoms, add_avatar, get_avatar, get_doctor_profile_patient_byId, \
    get_bowel_cancer_answers, get_exercise_plan, save_exercise_plan, get_breast_cancer_answer, get_user_full_name, \
    get_ovarian_cancer_answer, get_prostate_cancer_answer, save_dietary_preferences, cancel_appointment
from .dr_views import dr_register, search_specialty, find_patient, get_patient_information, get_pt_registered_in_days, \
    get_doctor_profile, save_patient_diagnosis, get_coming_meeting, get_doctor_working_time, get_patient_profile_doctor_byId, \
    update_doctor_profile
from .nu_views import nu_register, approve_diet_plan, DietPlanListView, get_unapproved_diet_plans, get_approval_status, \
    nufind_patient, update_meal, get_dietary_preferences, get_nutritionist_profile, update_nutritionist_profile

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('user/profile/<str:token>/', user_profile, name='user-profile'),
    path('user/login/', user_login, name='user-login'),
    path('user/get_user_appointments/<str:token>/', get_user_appointments, name='get-user-appointments'),
    path('user/search_gender/', search_gender, name='search-gender'),
    path('user/get_channel_id/<str:token>/', get_channel_id, name='get-channel-id'),
    path('user/get_target_message/<str:token>/', get_target_message, name='get-target-message'),
    path('user/get_contactors/<str:token>/', get_contactors, name='get-contactors'),
    path('user/start_contact_user/<str:token>/', start_contact_user, name='start_contact_user'),
    path('user/give_feedback/', give_feedback, name='give-feedback'),
    path('user/add_avatar/<str:token>/', add_avatar, name='add_avatar'),
    path('user/get_avatar/<str:token>/', get_avatar, name='get_avatar'),

    # patient
    path('patient/register/', pt_register, name='user-register'),
    path('patient/add_record/<str:token>/', patient_add_record, name='patient-add-record'),
    path('patient/height_weight_history/<str:token>/', user_height_weight_history, name='user-height-weight-history'),
    path('patient/update_contact/<str:token>/', update_contact, name='update-contact'),
    path('patient/search_allergy/', search_allergy, name='search-allergy'),
    path('patient/add_patient_allergy/<str:token>/', add_patient_allergy, name='add-patient-allergy'),
    path('patient/get_patient_allergy/<str:token>/', get_patient_allergies, name='get-patient-allergy'),
    path('patient/add_patient_other_allergy/<str:token>/', add_patient_other_allergy, name='add-patient-other-allergy'),
    path('patient/add_appointment/<str:token>/', add_appointment, name='add-appointment'),
    path('patient/get_patient_dob/<str:token>/', views.get_patient_dob, name='get_patient_dob'),
    # New path for fetching appointments
    path('patient/get_appointments/<str:token>/', patient_appointments, name='patient-appointments'),
    path('patient/user_full_name/<str:username>/', get_user_full_name, name='get_user_full_name'),
    path('patient/get_diet_plan/<str:token>/', get_diet_plan, name='get-diet-plan'),
    path('patient/get_patient_profile/<str:token>/', get_patient_profile, name='get-patient-profile'),
    path('patient/save_diet_plan/<str:token>/', save_diet_plan, name='save-diet-plan'),
    path('patient/save_patient_diagnosis/<str:token>/', save_patient_diagnosis, name='save-patient-diagnosis'),
    path('patient/store_user_name/<str:token>/', store_user_name, name='store-user-name'),
    path('patient/get_lung_cancer_answers/<str:token>/', get_lung_cancer_answers, name='get-lung-cancer-answers'),
    path('patient/get_bowel_cancer_answers/<str:token>/', get_bowel_cancer_answers, name='get_bowel_cancer_answers'),
    path('patient/get_breast_cancer_answers/<str:token>/', get_breast_cancer_answer, name='get_breast_cancer_answer'),
    path('patient/get_ovarian_cancer_answers/<str:token>/', get_ovarian_cancer_answer, name='get_ovarian_cancer_answer'),
    path('patient/get_prostate_cancer_answers/<str:token>/', get_prostate_cancer_answer,
         name='get_prostate_cancer_answer'),
    path('patient/add_unspecified_symptoms/<str:token>/', add_unspecified_symptoms, name='add-unspecified-symptoms'),
    # New path for storing username
    path('patient/get_user_name/<str:token>/', get_user_name, name='get-user-name'),
    path('patient/doctor-profile/<str:username>/<str:token>/', get_doctor_profile_patient,
         name='doctor-profile-patient'),
    path('patient/get_doctor_profile_patient_byId/<str:token>/', get_doctor_profile_patient_byId,
         name='get-doctor-profile-patient-byId'),
    # New path for cancelling an appointment
    path('patient/cancel_appointment/<str:token>/', cancel_appointment, name='cancel-appointment'),
    # New path for exercise plans
    # exercise plans
    path('patient/get_exercise_plan/<str:token>/', get_exercise_plan, name='get-exercise-plan'),
    path('patient/save_exercise_plan/<str:token>/', save_exercise_plan, name='save-exercise-plan'),
    path('patient/save_dietary_preferences/<str:token>/', save_dietary_preferences, name='save-dietary-preferences'),

    # doctor
    path('doctor/register/', dr_register, name='dr-register'),
    path('doctor/search_specialty/', search_specialty, name='search-specialty'),
    path('doctor/find_available_booking/', find_available_booking, name='find-available-booking'),
    path('doctor/add_availability/<str:token>/', add_availability, name='add-availability'),
    path('doctor/get_dr_appointments/<str:token>/', doctor_appointments, name='doctor-appointments'),
    path('doctor/get_pt_registered_in_days/<str:token>/', get_pt_registered_in_days, name='get-pt-registered-in-days'),
    path('doctor/find_patient/<str:token>/', find_patient, name='find-patient'),
    path('doctor/get_patient_information/<str:token>/', get_patient_information, name='get-patient-information'),
    path('doctor/get_doctor_profile/<str:token>/', get_doctor_profile, name='get-doctor-profile'),
    path('doctor/get_coming_meeting/<str:token>/', get_coming_meeting, name='get-coming-meeting'),
    path('doctor/get_doctor_working_time/<str:token>/', get_doctor_working_time, name='get-doctor-working-time'),
    path('doctor/get_patient_profile_doctor_byId/<str:token>/', get_patient_profile_doctor_byId, name='get-patient-profile-doctor-byId'),
    path('doctor/update_doctor_profile/<str:token>/', update_doctor_profile, name='update_doctor_profile'),

    # nutritionist
    path('nutritionist/register/', nu_register, name='nu-register'),
    path('nutritionist/approve-diet-plan/', approve_diet_plan, name='approve-diet-plan'),
    path('nutritionist/diet-plans/', DietPlanListView.as_view(), name='diet-plans'),
    path('nutritionist/get_unapproved_diet_plans/<str:token>/', get_unapproved_diet_plans,
         name='get-unapproved-diet-plans'),
    path('nutritionist/get_approval_status/', get_approval_status, name='get_approval_status'),
    path('nutritionist/nufind_patient/<str:token>/', nufind_patient, name='nufind-patient'),
    path('nutritionist/update-meal/', update_meal, name='update_meal'),
    path('nutritionist/dietary_preferences/', get_dietary_preferences, name='get_dietary_preferences'),
    path('nutritionist/get_nutritionist_profile/<str:token>/', get_nutritionist_profile, name='get_nutritionist_profile'),
    path('nutritionist/update_nutritionist_profile/<str:token>/', update_nutritionist_profile, name='update_nutritionist_profile'),
]
