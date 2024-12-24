from django.contrib import admin
from .models import SavoirUser, Doctor, DrSpecialty, Patient, PtAllergy, Allergy, CancerSymptom, PastRelatedHistory, PMHForRec, FamilyHistoryForRec, Condition, \
    AICancerPrediction, AIPatientRecommendation, PatientBirthday, PatientOtherAllergy, UnspecifiedSymptoms, UserFullName, DiagnosisReservation, DoctorAvailability, Gender, \
    Nutritionist, PtDietPlan, Feedback, PtDietPlanApproval, PtExercisePlan, DietaryPreferences, LungCancerSymptom, PtDiagnosis, PtDietRequirement

# admin.site.register(SavoirUser)
@admin.register(SavoirUser)
class SavoirUserAdmin(admin.ModelAdmin):
    list_display=['id','username']
admin.site.register(Doctor)
admin.site.register(DrSpecialty)
admin.site.register(Patient)
admin.site.register(PtAllergy)
admin.site.register(Allergy)
admin.site.register(CancerSymptom)
admin.site.register(PastRelatedHistory)
admin.site.register(PMHForRec)
admin.site.register(FamilyHistoryForRec)
admin.site.register(Condition)
admin.site.register(AICancerPrediction)
admin.site.register(AIPatientRecommendation)
admin.site.register(PatientBirthday)
admin.site.register(PatientOtherAllergy)
admin.site.register(UserFullName)
admin.site.register(DiagnosisReservation)
@admin.register(Gender)
class GenderAdmin(admin.ModelAdmin):
    list_display=['id','gender_name']
admin.site.register(DoctorAvailability)
admin.site.register(Nutritionist)
admin.site.register(PtDietPlan)
admin.site.register(PtDietRequirement)
admin.site.register(Feedback)
admin.site.register(PtDietPlanApproval)
admin.site.register(PtExercisePlan)
admin.site.register(DietaryPreferences)
admin.site.register(LungCancerSymptom)
admin.site.register(PtDiagnosis)
admin.site.register(UnspecifiedSymptoms)