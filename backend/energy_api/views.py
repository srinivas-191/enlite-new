# energy_api/views.py
import os
import traceback
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status

import joblib
import pandas as pd
from django.utils import timezone

from .models import (
    PredictionHistory,
    ManualPaymentRequest,
    Subscription,
)

User = get_user_model()

# -------------------------
# Model files / paths
# -------------------------
MODEL_DIR = os.path.join(settings.BASE_DIR, "energy_api", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
LE_PATH = os.path.join(MODEL_DIR, "model1.pkl")
SC_PATH = os.path.join(MODEL_DIR, "model2.pkl")

_loaded = {"model": None, "le": None, "sc": None, "features": None}

FEATURE_RANGES = {
    "Floor_Insulation": (0.15, 1.60),
    "Door_Insulation": (0.81, 5.70),
    "Roof_Insulation": (0.07, 2.28),
    "Window_Insulation": (0.73, 5.75),
    "Wall_Insulation": (0.10, 2.40),
    "Hvac_Efficiency": (0.30, 4.50),
    "Domestic_Hot_Water_Usage": (0.50, 3.50),
    "Lighting_Density": (1, 9),
    "Occupancy_Level": (1, 6),
    "Equipment_Density": (1, 21),
    "Window_To_Wall_Ratio": (0, 70),
    "Total_Building_Area": (85.91, 10000),
}

DEFAULT_VALUES = {
    "Floor_Insulation": 0.88,
    "Door_Insulation": 3.25,
    "Roof_Insulation": 1.17,
    "Window_Insulation": 3.24,
    "Wall_Insulation": 1.25,
    "Hvac_Efficiency": 3.25,
    "Domestic_Hot_Water_Usage": 2,
    "Lighting_Density": 5,
    "Occupancy_Level": 3,
    "Equipment_Density": 11,
    "Window_To_Wall_Ratio": 35,
    "Total_Building_Area": 85.91,
}

# -------------------------
# Helpers: load model & metadata
# -------------------------
def load_all():
    if _loaded["model"] is None:
        _loaded["model"] = joblib.load(MODEL_PATH)

    if _loaded["le"] is None:
        _loaded["le"] = joblib.load(LE_PATH)

    if _loaded["sc"] is None:
        _loaded["sc"] = joblib.load(SC_PATH)

    if _loaded["features"] is None:
        sc = _loaded["sc"]
        if hasattr(sc, "feature_names_in_"):
            _loaded["features"] = list(sc.feature_names_in_)
        else:
            _loaded["features"] = [
                "Building_Type",
                "Floor_Insulation",
                "Door_Insulation",
                "Roof_Insulation",
                "Window_Insulation",
                "Wall_Insulation",
                "Hvac_Efficiency",
                "Domestic_Hot_Water_Usage",
                "Lighting_Density",
                "Occupancy_Level",
                "Equipment_Density",
                "Window_To_Wall_Ratio",
                "Total_Building_Area",
            ]

    return _loaded["model"], _loaded["le"], _loaded["sc"], _loaded["features"]


# -------------------------
# Category & recommendations
# -------------------------
def monthly_category(eui):
    if eui is None:
        return "Unknown"
    if eui <= 12.50:
        return "Very Efficient"
    if eui <= 20.83:
        return "Average Efficiency"
    if eui <= 29.17:
        return "Moderately High"
    if eui <= 41.67:
        return "High Energy Consumption"
    return "Very Poor (Inefficient)"

def get_optimal_performance(user_vals, total_energy_month, area, model, sc):
    """Calculates the expected performance after fixing all issues."""
    optimal = {
        "Floor_Insulation": 0.20,
        "Door_Insulation": 1.00,
        "Roof_Insulation": 0.15,
        "Window_Insulation": 1.20,
        "Wall_Insulation": 0.25,
        "Hvac_Efficiency": 3.5,
        "Domestic_Hot_Water_Usage": 1.50,
        "Lighting_Density": 3,
        "Occupancy_Level": 3,
        "Equipment_Density": 8,
        "Window_To_Wall_Ratio": 30
    }

    # 1. Create optimal input by overwriting user's values with optimal targets
    optimal_input = user_vals.copy()
    for key, val in optimal.items():
        # Only overwrite if the key exists in user_vals (i.e., it was a feature)
        if key in optimal_input:
            optimal_input[key] = val

    # Convert to DataFrame with all features (important for sc.transform)
    optimal_df = pd.DataFrame([optimal_input])

    # 2. Scale and Predict
    optimal_scaled = sc.transform(optimal_df)
    optimal_year = float(model.predict(optimal_scaled)[0])
    optimal_month = optimal_year / 12.0
    optimal_eui = optimal_month / area if area else None

    # 3. Calculate Savings
    saved_kwh = total_energy_month - optimal_month
    saved_percent = (saved_kwh / total_energy_month) * 100 if total_energy_month > 0 else 0

    return {
        "optimal_energy_month_kwh": round(optimal_month, 2),
        "optimal_eui_month_kwh_m2": round(optimal_eui, 2) if optimal_eui else None,
        "saved_kwh": round(saved_kwh, 2),
        "saved_percent": round(saved_percent, 2),
        "expected_category": monthly_category(optimal_eui)
    }

def get_recommendations(user_vals):
    recommendations = []
    issues = []

    optimal = {
        "Floor_Insulation": 0.20,
        "Door_Insulation": 1.00,
        "Roof_Insulation": 0.15,
        "Window_Insulation": 1.20,
        "Wall_Insulation": 0.25,
        "Hvac_Efficiency": 3.5,
        "Domestic_Hot_Water_Usage": 1.50,
        "Lighting_Density": 3,
        "Occupancy_Level": 3,
        "Equipment_Density": 8,
        "Window_To_Wall_Ratio": 30
    }

    # MATERIAL OPTIONS ONLY FOR INSULATION
    insulation_materials = {
        "Floor_Insulation": "rigid PIR/XPS boards, mineral wool, or spray foam",
        "Door_Insulation": "thermally insulated doors with good sealing",
        "Roof_Insulation": "PIR boards, rockwool, cellulose, or spray foam",
        "Window_Insulation": "double-glazed low-E glass with argon filling",
        "Wall_Insulation": "mineral wool, EPS/XPS boards, or external insulated cladding"
    }

    for feature, opt in optimal.items():
        try:
            val = float(user_vals.get(feature, 0))
        except Exception:
            val = 0.0

        if feature in ["Floor_Insulation", "Door_Insulation", "Roof_Insulation",
                       "Window_Insulation", "Wall_Insulation"]:
            if val > opt * 1.5:
                issues.append(f"{feature.replace('_', ' ')} is too high (poor insulation).")
                recommendations.append(
                    f"Improve the {feature.replace('_',' ').lower()} (target: {opt}). "
                    f"Use: {insulation_materials[feature]}."
                )

        elif feature == "Hvac_Efficiency":
            if val < opt:
                issues.append("Low HVAC efficiency.")
                recommendations.append(f"Upgrade HVAC to COP {opt} or higher.")

        elif feature == "Domestic_Hot_Water_Usage":
            if val > opt * 1.3:
                issues.append("High hot water usage.")
                recommendations.append(
                    f"Use low-flow taps/showers or a solar water heater (recommended: {opt})."
                )

        elif feature == "Lighting_Density":
            if val > opt * 1.4:
                issues.append("Lighting density is high.")
                recommendations.append(
                    f"Switch to LED lights or reduce lighting (target LPD: {opt})."
                )

        elif feature == "Occupancy_Level":
            if val > opt * 1.5:
                issues.append("High occupancy load.")
                recommendations.append(
                    f"Avoid overcrowding and spread activities across the day (ideal: {opt})."
                )

        elif feature == "Equipment_Density":
            if val > opt * 1.4:
                issues.append("High equipment density.")
                recommendations.append(
                    f"Use energy-efficient appliances (target load: {opt})."
                )

        elif feature == "Window_To_Wall_Ratio":
            if val > 50:
                issues.append("High window-to-wall ratio.")
                recommendations.append(
                    f"Use shades or better glass to reduce heat gain (target WWR: {opt}%)."
                )

    return issues, recommendations


# -------------------------
# AUTH: register / login
# -------------------------
@api_view(["POST"])
def register_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "username and password required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(username=username, password=password)
    token, _ = Token.objects.get_or_create(user=user)

    # create default Subscription if not present
    Subscription.objects.get_or_create(
        user=user,
        defaults={
            "plan": "free",
            "allowed_predictions": 10,
            "remaining_predictions": 10,
            "active": False,
        },
    )

    return Response({
        "message": "User registered successfully",
        "token": token.key,
        "username": user.username,
        "is_admin": user.is_staff
    })


@api_view(["POST"])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "username and password required"}, status=400)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=400)

    token, _ = Token.objects.get_or_create(user=user)

    # ensure subscription exists
    Subscription.objects.get_or_create(
        user=user,
        defaults={
            "plan": "free",
            "allowed_predictions": 10,
            "remaining_predictions": 10,
            "active": False,
        },
    )

    return Response({
        "message": "Login successful",
        "token": token.key,
        "username": user.username,
        "is_admin": user.is_staff
    })


# -------------------------
# BASIC: building types / defaults
# -------------------------
@api_view(["GET"])
def get_building_types(request):
    _, le, _, _ = load_all()
    # Le might be a label-encoder with classes_
    try:
        classes = [bt.title() for bt in le.classes_]
    except Exception:
        classes = []
    return Response({"building_types": classes})


@api_view(["GET"])
def get_defaults(request):
    _, _, _, features = load_all()
    return Response({
        "features": features,
        "feature_ranges": FEATURE_RANGES,
        "defaults": DEFAULT_VALUES
    })


# -------------------------
# PREDICT: uses Subscription to deduct remaining predictions
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def predict_energy(request):
  user = request.user

  # ensure subscription exists
  sub, _ = Subscription.objects.get_or_create(
    user=user,
    defaults={
      "plan": "free",
      "allowed_predictions": 10,
      "remaining_predictions": 10,
      "active": False,
    }
  )

  # check remaining predictions
  if sub.remaining_predictions is None:
    # Defensive: if None, treat as unlimited only for admins
    if not user.is_staff:
      return Response({"error": "LIMIT_UNSPECIFIED"}, status=403)
  elif sub.remaining_predictions <= 0:
    if not sub.active:
      return Response({"error": "TRIAL_EXPIRED", "message": "Your free trial has ended. Please upgrade."}, status=403)
    return Response({"error": "LIMIT_REACHED", "message": "Your plan limit is over."}, status=403)

  # load model
  try:
    model, le, sc, features = load_all()
  except Exception as e:
    return Response({"error": "Model loading failed", "details": str(e)}, status=500)

  try:
    data = request.data
    row = []

    for feat in features:
      if feat == "Building_Type":
        val = data.get("Building_Type")
        if not val:
          return Response({"error": "Missing Building_Type"}, status=400)
        try:
          # label encoder may expect lowercase; handle gracefully
          encoded = int(le.transform([val.lower()])[0])
        except Exception:
          # try without lower
          try:
            encoded = int(le.transform([val])[0])
          except Exception:
            return Response({"error": f"Invalid Building_Type: {val}"}, status=400)
        row.append(encoded)
      else:
        if feat not in data:
          return Response({"error": f"Missing feature: {feat}"}, status=400)
        row.append(float(data[feat]))

    df = pd.DataFrame([row], columns=features)
    scaled = sc.transform(df)

    yearly = float(model.predict(scaled)[0])
    monthly = yearly / 12.0
    area = float(data.get("Total_Building_Area") or 0)
    eui = monthly / area if area else None

    user_vals = df.iloc[0].to_dict()
    issues, recs = get_recommendations(user_vals)
    impacting = issues if issues else ["No major issues detected."]

        # Calculate optimal performance after recommendations
    optimal_performance = get_optimal_performance(user_vals, monthly, area, model, sc)

    record = PredictionHistory.objects.create(
      user=user,
      building_type=data.get("Building_Type"),
      total_energy_month_kwh=round(monthly, 2),
      eui_month_kwh_m2=round(eui, 2) if eui else None,
      performance_category=monthly_category(eui),
      inputs=data,
    )

    # consume one prediction (skip for admins)
    if not user.is_staff:
      # use model method if available
      try:
        sub.consume_prediction(1)
      except Exception:
        # fallback decrement & save
        if sub.remaining_predictions is not None:
          sub.remaining_predictions = max(0, sub.remaining_predictions - 1)
          sub.save()

    return Response({
      "record_id": record.id,
      "total_energy_month_kwh": record.total_energy_month_kwh,
      "eui_month_kwh_m2": record.eui_month_kwh_m2,
      "performance_category": record.performance_category,
      "impacting_factors": impacting,
      "recommendations": recs,
      "remaining_predictions": sub.remaining_predictions,
            "optimal_performance": optimal_performance # Include the new data
    })

  except Exception as e:
    return Response({"error": str(e), "trace": traceback.format_exc()}, status=500)

# -------------------------
# HISTORY endpoints
# -------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_history(request):
    history = PredictionHistory.objects.filter(user=request.user, is_deleted_by_user=False).order_by("-created_at")
    data = [{
        "id": h.id,
        "building_type": h.building_type,
        "energy": h.total_energy_month_kwh,
        "eui": h.eui_month_kwh_m2,
        "category": h.performance_category,
        "inputs": h.inputs,
        "date": h.created_at,
    } for h in history]
    return Response({"history": data})


# -------------------------
# PROFILE
# -------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    total_predictions = PredictionHistory.objects.filter(user=user).count()
    last = PredictionHistory.objects.filter(user=user).order_by("-created_at").first()

    last_data = None
    if last:
        last_data = {
            "id": last.id,
            "building_type": last.building_type,
            "energy": last.total_energy_month_kwh,
            "eui": last.eui_month_kwh_m2,
            "category": last.performance_category,
            "inputs": last.inputs,
            "date": last.created_at,
        }

    # add subscription summary
    sub = None
    try:
        sub = Subscription.objects.get(user=user)
        subscription_data = {
            "plan": sub.plan,
            "allowed_predictions": sub.allowed_predictions,
            "remaining_predictions": sub.remaining_predictions,
            "active": sub.active,
            "start_date": sub.start_date,
            "end_date": sub.end_date,
        }
    except Subscription.DoesNotExist:
        subscription_data = None

    return Response({
        "username": user.username,
        "is_admin": user.is_staff,
        "joined_on": user.date_joined,
        "total_predictions": total_predictions,
        "last_prediction": last_data,
        "subscription": subscription_data
    })


# -------------------------
# DELETE HISTORY
# -------------------------
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_all_history(request):
    count = PredictionHistory.objects.filter(user=request.user).update(is_deleted_by_user=True)
    return Response({"message": f"Hidden {count} items from your history"})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_history_item(request, pk):
    item = get_object_or_404(PredictionHistory, pk=pk)
    if item.user != request.user and not request.user.is_staff:
        return Response({"error": "Not allowed"}, status=403)
    item.is_deleted_by_user = True
    item.save()
    return Response({"message": "Deleted successfully"})


# -------------------------
# ADMIN endpoints
# -------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_list_users(request):
    if not request.user.is_staff:
        return Response({"error": "Access denied"}, status=403)

    users = User.objects.annotate(prediction_count=Count("predictionhistory")).order_by("-date_joined")
    data = [{
        "username": u.username,
        "joined_on": u.date_joined,
        "is_admin": u.is_staff,
        "prediction_count": u.prediction_count,
    } for u in users]
    return Response({"users": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_user_history(request, username):
    if not request.user.is_staff:
        return Response({"error": "Access denied"}, status=403)

    user = get_object_or_404(User, username=username)
    history = PredictionHistory.objects.filter(user=user).order_by("-created_at")

    data = [{
        "id": h.id,
        "building_type": h.building_type,
        "energy": h.total_energy_month_kwh,
        "eui": h.eui_month_kwh_m2,
        "category": h.performance_category,
        "inputs": h.inputs,
        "date": h.created_at,
    } for h in history]

    return Response({"username": user.username, "history": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_all_history(request):
    if not request.user.is_staff:
        return Response({"error": "Access denied"}, status=403)

    records = PredictionHistory.objects.all().order_by("-created_at")
    data = [{
        "id": h.id,
        "user": h.user.username,
        "building_type": h.building_type,
        "energy": h.total_energy_month_kwh,
        "eui": h.eui_month_kwh_m2,
        "category": h.performance_category,
        "inputs": h.inputs,
        "date": h.created_at,
    } for h in records]
    return Response({"all_history": data})


# -------------------------
# Update user (username / password)
# -------------------------
@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user
    data = request.data
    changes = {}

    new_username = data.get("username")
    if new_username and new_username != user.username:
        if User.objects.filter(username=new_username).exclude(pk=user.pk).exists():
            return Response({"error": "Username already taken"}, status=400)
        user.username = new_username
        changes["username"] = new_username

    current_password = data.get("password")
    new_password = data.get("new_password")

    if new_password:
        if not current_password:
            return Response({"error": "Current password required"}, status=400)
        if not user.check_password(current_password):
            return Response({"error": "Current password incorrect"}, status=400)
        user.set_password(new_password)
        changes["password_changed"] = True

    if changes:
        user.save()
        return Response({"message": "Updated successfully", "changes": changes})

    return Response({"message": "No changes"})


# -------------------------
# MANUAL PAYMENT REQUESTS
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def manual_payment_request(request):
    user = request.user

    plan = request.data.get("plan")
    amount = request.data.get("amount") or 0

    # NEW FIELDS
    bank_name = request.data.get("bank_name", "")
    txn_id = request.data.get("txn_id", "")

    notes = request.data.get("notes", "")
    screenshot = request.FILES.get("screenshot")

    if not plan:
        return Response({"error": "Missing plan"}, status=400)

    # Save to DB
    m = ManualPaymentRequest.objects.create(
        user=user,
        plan=plan,
        amount=amount,
        bank_name=bank_name,
        txn_id=txn_id,
        notes=notes,
        screenshot=screenshot,
        status="pending"
    )

    return Response({"message": "Saved", "request_id": m.id})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_manual_requests(request):
    user = request.user
    items = ManualPaymentRequest.objects.filter(user=user).order_by("-created_at")
    data = [{
        "id": it.id,
        "plan": it.plan,
        "amount": float(it.amount),
        "bank_name": it.bank_name,   # ← ADD HERE
        "txn_id": it.txn_id, 
        "txn_ref": it.txn_ref,
        "notes": it.notes,
        "status": it.status,
        "created_at": it.created_at,
        "screenshot_url": it.screenshot.url if it.screenshot else None,
        "admin_note": it.admin_note,
    } for it in items]
    return Response({"requests": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_subscription(request):
    try:
        sub = Subscription.objects.get(user=request.user)
    except Subscription.DoesNotExist:
        sub = Subscription.objects.create(
            user=request.user,
            plan="free",
            allowed_predictions=10,
            remaining_predictions=10,
            active=False
        )

    data = {
        "plan": sub.plan,
        "allowed_predictions": sub.allowed_predictions,
        "remaining_predictions": sub.remaining_predictions,
        "active": sub.active,
        "start_date": sub.start_date,
        "end_date": sub.end_date,
    }
    return Response({"subscription": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_list_manual_requests(request):
    if not request.user.is_staff:
        return Response({"error": "Access denied"}, status=403)

    items = ManualPaymentRequest.objects.all().order_by("-created_at")
    data = [{
        "id": it.id,
        "user": it.user.username,
        "user_id": it.user.id,
        "plan": it.plan,
        "amount": float(it.amount),
        "bank_name": it.bank_name,
        "txn_id": it.txn_id,

        "txn_ref": it.txn_ref,
        "notes": it.notes,
        "status": it.status,
        "screenshot_url": it.screenshot.url if it.screenshot else None,
        "created_at": it.created_at,
        "admin_note": it.admin_note,
    } for it in items]
    return Response({"requests": data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_approve_manual_request(request, pk):
    if not request.user.is_staff:
        return Response({"error": "Access denied"}, status=403)

    admin_user = request.user
    try:
        req = ManualPaymentRequest.objects.get(pk=pk)
    except ManualPaymentRequest.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    note = request.data.get("admin_note", "")

    # mark approved
    req.mark_approved(admin_user=admin_user)
    if note:
        req.admin_note = note
        req.save()

    # grant subscription and reset remaining predictions
    sub, created = Subscription.objects.get_or_create(user=req.user)
    sub.grant_plan(req.plan)  # grant_plan handles lowercasing and mapping

    # Optionally return updated subscription state
    return Response({
        "message": "Approved and subscription granted",
        "request_id": req.id,
        "granted_plan": sub.plan,
        "remaining_predictions": sub.remaining_predictions
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_reject_manual_request(request, pk):
    """Marks a manual payment request as rejected."""
    if not request.user.is_staff:
        return Response({"error": "Access denied"}, status=403)

    admin_user = request.user
    try:
        req = ManualPaymentRequest.objects.get(pk=pk)
    except ManualPaymentRequest.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    note = request.data.get("admin_note", "")

    # mark rejected (from models.py)
    req.mark_rejected(admin_user=admin_user, note=note) # Uses mark_rejected method
    
    # DO NOT grant subscription
    return Response({
        "message": "Request rejected",
        "request_id": req.id,
    })

# --- NEW ADMIN DELETE ENDPOINT ---
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def admin_delete_manual_request(request, pk):
    """Permanently deletes a manual payment request by primary key (pk)."""
    if not request.user.is_staff:
        return Response({"error": "Access denied"}, status=403)

    try:
        # Hard delete (removes record permanently)
        req = ManualPaymentRequest.objects.get(pk=pk)
        req.delete()
        return Response({"message": f"Manual payment request {pk} permanently deleted."})
    except ManualPaymentRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)
# --- END NEW ADMIN DELETE ENDPOINT ---

# Plans listing
@api_view(["GET"])
def get_plans(request):
    plans = {
        "basic": {"price": 75, "predictions": 100},
        "super": {"price": 175, "predictions": 300},
        "premium": {"price": 300, "predictions": 500},
    }
    return Response({"plans": plans})
