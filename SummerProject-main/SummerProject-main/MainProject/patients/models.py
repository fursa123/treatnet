from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        if password:
            user.set_password(password)  # Correct way to hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)


class SavoirUser(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=255)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    last_login = models.DateTimeField(auto_now=True)
    registration_date = models.DateTimeField(default=timezone.now)
    is_delete = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.IntegerField(default=0)
    is_superuser = models.BooleanField(default=False)
    password = models.CharField(max_length=128)

    # objects = UserManager()
    objects = models.Manager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username


class DrSpecialty(models.Model):
    specialty_type = models.CharField(max_length=100)

    def __str__(self):
        return self.specialty_type


class Doctor(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    school = models.CharField(max_length=255)
    seniority = models.CharField(max_length=255)
    specialty = models.ForeignKey(DrSpecialty, on_delete=models.CASCADE)
    experience_years = models.PositiveIntegerField()
    is_authenticated = models.BooleanField(default=False)

    objects = models.Manager()

    def __str__(self):
        return f"Dr. {self.user}"


class Nutritionist(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    qualification = models.CharField(max_length=255)
    experience_years = models.PositiveIntegerField()
    is_authenticated = models.BooleanField(default=False)

    objects = models.Manager()

    def __str__(self):
        return f"{self.user}"


class Patient(models.Model):
    user = models.ForeignKey(SavoirUser, on_delete=models.CASCADE)
    weight = models.FloatField(null=False, blank=False, default=0.0)
    height = models.FloatField(null=False, blank=False, default=0.0)
    date_changed = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self):
        return self.user.username


class DiagnosisReservation(models.Model):
    pt_user = models.ForeignKey(SavoirUser, related_name='pt_reservations', on_delete=models.CASCADE)
    dr_user = models.ForeignKey(SavoirUser, related_name='dr_reservations', on_delete=models.CASCADE)
    reservation_date = models.DateTimeField()
    is_delete = models.BooleanField(default=False)

    objects = models.Manager()

    def __str__(self):
        return self.dr_user.username + '-->' + self.pt_user.username + ': ' + self.reservation_date.__str__()


class DoctorAvailability(models.Model):
    dr_user = models.ForeignKey(SavoirUser, on_delete=models.CASCADE)
    date = models.DateField(null=True, blank=True)
    time = models.TimeField()
    is_available = models.BooleanField(default=True)

    objects = models.Manager()

    def __str__(self):
        return f"{self.dr_user.username} - {self.date} {self.time}"


class PatientBirthday(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    dob = models.DateField()

    def __str__(self):
        return self.user.username


class Gender(models.Model):
    gender_name = models.CharField(max_length=30)

    def __str__(self):
        return self.gender_name


class UserFullName(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    forenames = models.TextField(max_length=400)
    surname = models.TextField(max_length=200)
    gender = models.ForeignKey(Gender, default=5, null=True, blank=True, related_name='user_gender',
                               on_delete=models.CASCADE)
    objects = models.Manager()

    def __str__(self):
        return str(self.user.id) + '_' + self.user.username


class PatientOtherAllergy(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    otherAllergy = models.TextField(max_length=300)

    def __str__(self):
        return self.user.username


class Allergy(models.Model):
    allergy_name = models.CharField(max_length=100)

    objects = models.Manager()

    def __str__(self):
        return self.allergy_name


class PtAllergy(models.Model):
    user = models.ForeignKey(SavoirUser, on_delete=models.CASCADE)
    allergy = models.ForeignKey(Allergy, on_delete=models.CASCADE)

    objects = models.Manager()

    def __str__(self):
        return self.user.username + '_' + self.allergy.allergy_name


class CancerSymptom(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    Q1 = models.BooleanField()
    Q2 = models.BooleanField()
    Q3 = models.BooleanField()
    Q4 = models.BooleanField()


class PastRelatedHistory(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    Q1 = models.BooleanField()
    Q2 = models.BooleanField()
    Q3 = models.BooleanField()
    Q4 = models.BooleanField()


class PMHForRec(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    condition = models.ForeignKey('Condition', on_delete=models.CASCADE)


class FamilyHistoryForRec(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    condition = models.ForeignKey('Condition', on_delete=models.CASCADE)


class Condition(models.Model):
    condition_name = models.CharField(max_length=100)

    def __str__(self):
        return self.condition_name


class AICancerPrediction(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    prediction = models.TextField()
    date_issued = models.DateTimeField(auto_now_add=True)


class AIPatientRecommendation(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    recommendation = models.TextField()
    date_issued = models.DateTimeField(auto_now_add=True)


class PtDietPlan(models.Model):
    user = models.ForeignKey(SavoirUser, on_delete=models.CASCADE)
    week_num = models.IntegerField(validators=[
        MinValueValidator(0),
        MaxValueValidator(3)
    ])
    day_num = models.IntegerField(validators=[
        MinValueValidator(0),
        MaxValueValidator(6)
    ])
    meal_num = models.IntegerField(validators=[
        MinValueValidator(0),
        MaxValueValidator(4)
    ])
    meal = models.TextField()
    generated_time = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)

    objects = models.Manager()

    def __str__(self):
        return self.user.username + '_' + str(self.week_num) + '_' + str(self.day_num) + '_' + str(
            self.meal_num) + '_' + self.meal


class PtDietPlanApproval(models.Model):
    user = models.ForeignKey(SavoirUser, on_delete=models.CASCADE)
    approval_status = models.BooleanField(default=False)
    approval_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}_{self.approval_status}"


class PtDiagnosis(models.Model):
    user = models.ForeignKey(SavoirUser, related_name='pt_diagnosis', on_delete=models.CASCADE)
    diagnosis = models.TextField()
    generation_time = models.DateTimeField(auto_now_add=True)
    diagnosed_dr = models.ForeignKey(SavoirUser, related_name='dr_diagnosis', on_delete=models.CASCADE)

    objects = models.Manager()

    def __str__(self):
        return self.user.username + '-' + self.diagnosis


class PtDietRequirement(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    requirement = models.TextField(max_length=150)

    objects = models.Manager()

    def __str__(self):
        return self.user.username + '-' + self.requirement


class PtExercisePlan(models.Model):
    user = models.ForeignKey(SavoirUser, on_delete=models.CASCADE)
    week_num = models.IntegerField(validators=[
        MinValueValidator(0),
        MaxValueValidator(3)
    ])
    day_num = models.IntegerField(validators=[
        MinValueValidator(0),
        MaxValueValidator(6)
    ])
    exercise = models.TextField()  # Store exercise details
    generated_time = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)  # Optional, if approval is required

    objects = models.Manager()

    def __str__(self):
        return f"{self.user.username}_{self.week_num}_{self.day_num}_{self.exercise}"


class ChatChannel(models.Model):
    pt_user = models.ForeignKey(SavoirUser, related_name='pt_message', on_delete=models.CASCADE)
    staff_user = models.ForeignKey(SavoirUser, related_name='staff_message', on_delete=models.CASCADE)
    generation_time = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    def __str__(self):
        return self.pt_user.username + '-' + self.staff_user.username


class Message(models.Model):
    channel = models.ForeignKey(ChatChannel, on_delete=models.CASCADE)
    user = models.ForeignKey(SavoirUser, on_delete=models.CASCADE)
    content = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()


class AIPredictionResult(models.Model):
    user = models.ForeignKey(SavoirUser, on_delete=models.CASCADE)
    level = models.IntegerField(validators=[
        MinValueValidator(0),
        MaxValueValidator(2)
    ])  # 0-low, 1-medium, 2-high
    generation_time = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()


class Feedback(models.Model):
    email = models.EmailField()
    content = models.CharField(max_length=300)
    feedback_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email + '_' + self.content


class UnspecifiedSymptoms(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    WeightLoss = models.BooleanField()
    Fatigue = models.BooleanField()
    Fever = models.BooleanField()
    Pain = models.BooleanField()
    SkinChanges = models.BooleanField()
    BowelBladderChanges = models.BooleanField()
    BleedingBruising = models.BooleanField()
    Lumps = models.BooleanField()
    Cough = models.BooleanField()
    Dysphagia = models.BooleanField()
    Anorexia = models.BooleanField()
    NightSweats = models.BooleanField()
    Lymphoedema = models.BooleanField()
    NeuroSymptoms = models.BooleanField()
    AbdoPain = models.BooleanField()
    other_symptom = models.CharField(max_length=300)
    generation_time = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()


class LungCancerSymptom(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    Q1 = models.IntegerField()
    Q2 = models.IntegerField()
    Q3 = models.IntegerField()
    Q4 = models.IntegerField()
    Q5 = models.IntegerField()
    Q6 = models.IntegerField()
    Q7 = models.IntegerField()
    Q8 = models.IntegerField()
    Q9 = models.IntegerField()
    Q10 = models.IntegerField()
    Q11 = models.IntegerField()
    Q12 = models.IntegerField()
    Q13 = models.IntegerField()
    Q14 = models.IntegerField()
    Q15 = models.IntegerField()
    Q16 = models.IntegerField()
    Q17 = models.IntegerField()
    Q18 = models.IntegerField()
    Q19 = models.IntegerField()
    Q20 = models.IntegerField()
    Q21 = models.IntegerField()
    Q22 = models.IntegerField()
    Q23 = models.IntegerField()
    result = models.IntegerField()
    generation_time = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()


class BowelCancerSymptom(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    Q1 = models.IntegerField()
    Q2 = models.IntegerField()
    Q3 = models.IntegerField()
    Q4 = models.IntegerField()
    Q5 = models.IntegerField()
    Q6 = models.IntegerField()
    Q7 = models.IntegerField()
    Q8 = models.IntegerField()
    Q9 = models.IntegerField()
    Q10 = models.IntegerField()
    Q11 = models.IntegerField()
    Q12 = models.IntegerField()
    Q13 = models.IntegerField()
    Q14 = models.IntegerField()
    Q15 = models.IntegerField()
    Q16 = models.IntegerField()
    Q17 = models.IntegerField()
    Q18 = models.IntegerField()
    result = models.IntegerField()
    generation_time = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()


class BreastCancerSymptom(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    Q1 = models.IntegerField()
    Q2 = models.IntegerField()
    Q3 = models.IntegerField()
    Q4 = models.IntegerField()
    Q5 = models.IntegerField()
    Q6 = models.IntegerField()
    Q7 = models.IntegerField()
    Q8 = models.IntegerField()
    Q9 = models.IntegerField()
    Q10 = models.IntegerField()
    Q11 = models.IntegerField()
    Q12 = models.IntegerField()
    Q13 = models.IntegerField()
    Q14 = models.IntegerField()
    Q15 = models.IntegerField()
    Q16 = models.IntegerField()
    result = models.IntegerField()
    generation_time = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()


class OvarianCancerSymptom(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    Q1 = models.IntegerField()
    Q2 = models.IntegerField()
    Q3 = models.IntegerField()
    Q4 = models.IntegerField()
    Q5 = models.IntegerField()
    Q6 = models.IntegerField()
    Q7 = models.IntegerField()
    Q8 = models.IntegerField()
    Q9 = models.IntegerField()
    Q10 = models.IntegerField()
    Q11 = models.IntegerField()
    Q12 = models.IntegerField()
    Q13 = models.IntegerField()
    Q14 = models.IntegerField()
    Q15 = models.IntegerField()
    Q16 = models.IntegerField()
    Q17 = models.IntegerField()
    result = models.IntegerField()
    generation_time = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()


class ProstateCancerSymptom(models.Model):
    user = models.OneToOneField(SavoirUser, on_delete=models.CASCADE)
    Q1 = models.IntegerField()
    Q2 = models.IntegerField()
    Q3 = models.IntegerField()
    Q4 = models.IntegerField()
    Q5 = models.IntegerField()
    Q6 = models.IntegerField()
    Q7 = models.IntegerField()
    Q8 = models.IntegerField()
    Q9 = models.IntegerField()
    Q10 = models.IntegerField()
    Q11 = models.IntegerField()
    Q12 = models.IntegerField()
    Q13 = models.IntegerField()
    Q14 = models.IntegerField()
    Q15 = models.IntegerField()
    Q16 = models.IntegerField()
    result = models.IntegerField()
    generation_time = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    
class DietaryPreferences(models.Model):
    user = models.ForeignKey(SavoirUser, on_delete=models.CASCADE)
    vegetarian = models.BooleanField()
    vegan = models.BooleanField()
    pescatarian = models.BooleanField()
    halal = models.BooleanField()
    kosher = models.BooleanField()
    glutenFree = models.BooleanField()
    lactoseFree = models.BooleanField()
    other = models.BooleanField()
    otherDetails = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}"
