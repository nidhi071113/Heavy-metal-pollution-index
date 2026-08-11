"""
ndvi_detector.py — Real-Time NDVI Analyzer via OpenAI Vision
=============================================================
Point your webcam at a green patch → see NDVI + carbon credits live!

Controls:
  ESC  — Quit
  SPACE — Force an immediate analysis (don't wait for timer)
"""

import cv2
import numpy as np
import threading
import time
from openai_ndvi import get_ndvi_from_openai
from carbon_calculator import calculate_carbon_credits

# ──────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────
OPENAI_CALL_INTERVAL = 6   # seconds between automatic API calls
AREA_SQM = 1.0             # demo area in square meters

# ──────────────────────────────────────────────
# SHARED STATE (updated by background thread)
# ──────────────────────────────────────────────
state = {
    "ndvi_data": {
        "ndvi": 0.0,
        "vegetation_coverage_percent": 0,
        "vegetation_health": "Initialising...",
        "confidence": "-",
        "reasoning": "Point camera at a green patch and wait..."
    },
    "carbon": {
        "co2_kg_per_year": 0.0,
        "carbon_credits": 0.0,
        "credit_value_usd": 0.0,
        "credit_value_inr": 0.0,
        "ecosystem_tier": "-"
    },
    "analyzing": False,
    "last_error": "",
    "next_call_in": OPENAI_CALL_INTERVAL,
    "force_analyze": False
}
state_lock = threading.Lock()

last_captured_frame = [None]   # holds a copy of the latest webcam frame


# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────
def ndvi_color(ndvi: float):
    """Return a BGR colour to represent the NDVI level."""
    if ndvi >= 0.60:
        return (46, 204, 64)      # Bright green
    elif ndvi >= 0.40:
        return (0, 204, 204)      # Yellow-green
    elif ndvi >= 0.20:
        return (0, 165, 255)      # Orange
    elif ndvi >= 0.05:
        return (0, 80, 220)       # Red-orange
    else:
        return (0, 0, 180)        # Red (no vegetation)


def draw_rounded_rect(img, pt1, pt2, color, radius=12, thickness=-1, alpha=0.85):
    """Draw a semi-transparent rounded rectangle."""
    overlay = img.copy()
    x1, y1 = pt1
    x2, y2 = pt2
    cv2.rectangle(overlay, (x1 + radius, y1), (x2 - radius, y2), color, thickness)
    cv2.rectangle(overlay, (x1, y1 + radius), (x2, y2 - radius), color, thickness)
    for cx, cy in [(x1+radius, y1+radius), (x2-radius, y1+radius),
                   (x1+radius, y2-radius), (x2-radius, y2-radius)]:
        cv2.circle(overlay, (cx, cy), radius, color, thickness)
    cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)


def draw_ui(frame, s: dict):
    """Render the HUD overlay on each frame."""
    h, w = frame.shape[:2]
    nd = s["ndvi_data"]
    cb = s["carbon"]
    ndvi  = nd.get("ndvi", 0.0)
    color = ndvi_color(ndvi)
    panel_h = 230

    # ── Semi-transparent background panel ──
    draw_rounded_rect(frame, (10, 8), (w - 10, panel_h), (15, 15, 25), radius=16, alpha=0.80)

    # ── Header ──
    cv2.putText(frame, "NDVI LIVE ANALYZER", (28, 42),
                cv2.FONT_HERSHEY_DUPLEX, 0.85, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(frame, "powered by OpenAI Vision", (28, 62),
                cv2.FONT_HERSHEY_SIMPLEX, 0.38, (140, 140, 160), 1, cv2.LINE_AA)

    # ── NDVI progress bar ──
    bar_x1, bar_y1 = 28, 78
    bar_x2, bar_y2 = w - 28, 102
    cv2.rectangle(frame, (bar_x1, bar_y1), (bar_x2, bar_y2), (50, 50, 60), -1)
    fill_w = int(np.clip(ndvi, 0, 1) * (bar_x2 - bar_x1))
    if fill_w > 0:
        cv2.rectangle(frame, (bar_x1, bar_y1), (bar_x1 + fill_w, bar_y2), color, -1)
    # tick marks at 0.25 intervals
    for t in [0.25, 0.50, 0.75]:
        tx = bar_x1 + int(t * (bar_x2 - bar_x1))
        cv2.line(frame, (tx, bar_y1), (tx, bar_y2), (100, 100, 110), 1)
    cv2.rectangle(frame, (bar_x1, bar_y1), (bar_x2, bar_y2), (80, 80, 90), 1)
    cv2.putText(frame, f"NDVI  {ndvi:+.3f}", (bar_x1 + 6, bar_y1 + 17),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)

    # ── Two column stats ──
    col1_x, col2_x = 28, w // 2 + 10
    row_y = [120, 143, 166, 189, 212]

    def label_val(x, y, label, val, val_color=(210, 210, 220)):
        cv2.putText(frame, label, (x, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.48, (130, 130, 145), 1, cv2.LINE_AA)
        cv2.putText(frame, val, (x + 110, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.50, val_color, 1, cv2.LINE_AA)

    # Left column
    label_val(col1_x, row_y[0], "Coverage :", f"{nd.get('vegetation_coverage_percent', 0)} %")
    label_val(col1_x, row_y[1], "Health   :", nd.get("vegetation_health", "-"), color)
    label_val(col1_x, row_y[2], "Confidence:", nd.get("confidence", "-"))
    label_val(col1_x, row_y[3], "Tier     :", cb.get("ecosystem_tier", "-"), (120, 230, 180))

    # Right column  — carbon data
    label_val(col2_x, row_y[0], "CO2/yr  :", f"{cb.get('co2_kg_per_year', 0):.4f} kg")
    label_val(col2_x, row_y[1], "Credits :", f"{cb.get('carbon_credits', 0):.6f}")
    label_val(col2_x, row_y[2], "USD     :", f"$ {cb.get('credit_value_usd', 0):.5f}", (100, 220, 255))
    label_val(col2_x, row_y[3], "INR     :", f"₹ {cb.get('credit_value_inr', 0):.3f}", (100, 220, 255))

    # ── AI Reasoning strip at bottom of panel ──
    reason = nd.get("reasoning", "")[:72]
    cv2.putText(frame, f"AI: {reason}", (28, row_y[4]),
                cv2.FONT_HERSHEY_SIMPLEX, 0.40, (160, 170, 190), 1, cv2.LINE_AA)

    # ── Status badge (top right) ──
    if s["analyzing"]:
        badge_txt = "  Analysing ....  "
        badge_col = (0, 180, 255)
    elif s["last_error"]:
        badge_txt = "  Error   "
        badge_col = (0, 60, 220)
    else:
        badge_txt = f"  Next scan in {s['next_call_in']}s  "
        badge_col = (50, 160, 50)

    (tw, th), _ = cv2.getTextSize(badge_txt, cv2.FONT_HERSHEY_SIMPLEX, 0.42, 1)
    bx = w - tw - 30
    cv2.rectangle(frame, (bx - 6, 12), (bx + tw + 6, 12 + th + 10), badge_col, -1)
    cv2.putText(frame, badge_txt, (bx, 12 + th + 4),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)

    # ── Controls hint ──
    cv2.putText(frame, "ESC: Quit   SPACE: Analyse Now", (28, h - 14),
                cv2.FONT_HERSHEY_SIMPLEX, 0.40, (100, 100, 110), 1, cv2.LINE_AA)

    return frame


# ──────────────────────────────────────────────
# BACKGROUND API WORKER THREAD
# ──────────────────────────────────────────────
def api_worker():
    global state
    countdown = OPENAI_CALL_INTERVAL

    while True:
        time.sleep(1)

        with state_lock:
            force = state.get("force_analyze", False)
            analyzing = state["analyzing"]

        if analyzing:
            continue

        if force:
            countdown = 0
            with state_lock:
                state["force_analyze"] = False

        countdown -= 1
        with state_lock:
            state["next_call_in"] = max(countdown, 0)

        if countdown <= 0:
            countdown = OPENAI_CALL_INTERVAL
            frame = last_captured_frame[0]
            if frame is None:
                continue

            with state_lock:
                state["analyzing"] = True
                state["last_error"] = ""

            try:
                ndvi_data = get_ndvi_from_openai(frame)
                carbon    = calculate_carbon_credits(ndvi_data["ndvi"], AREA_SQM)
                with state_lock:
                    state["ndvi_data"] = ndvi_data
                    state["carbon"]    = carbon
                    state["analyzing"] = False
                print(f"[OK] NDVI={ndvi_data['ndvi']:.3f}  Coverage={ndvi_data['vegetation_coverage_percent']}%  Credits={carbon['carbon_credits']:.6f}")
            except Exception as e:
                err = str(e)[:80]
                with state_lock:
                    state["last_error"] = err
                    state["analyzing"]  = False
                print(f"[ERROR] {err}")


# ──────────────────────────────────────────────
# MAIN LOOP
# ──────────────────────────────────────────────
def main():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Could not open webcam. Check if it is connected and not in use.")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)

    # Start background thread
    t = threading.Thread(target=api_worker, daemon=True)
    t.start()

    print("=" * 60)
    print("  🌿 Real-Time NDVI Detector — Powered by OpenAI Vision")
    print("=" * 60)
    print(f"  ✅ Webcam opened.")
    print(f"  📡 Analysing frame every {OPENAI_CALL_INTERVAL} seconds.")
    print(f"  🖥  Press SPACE to analyse immediately, ESC to quit.")
    print("=" * 60)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Failed to read frame from webcam.")
            break

        last_captured_frame[0] = frame.copy()

        with state_lock:
            s_snapshot = {
                "ndvi_data": dict(state["ndvi_data"]),
                "carbon":    dict(state["carbon"]),
                "analyzing": state["analyzing"],
                "last_error": state["last_error"],
                "next_call_in": state["next_call_in"]
            }

        display = draw_ui(frame, s_snapshot)
        cv2.imshow("Real-Time NDVI Detector ", display)

        key = cv2.waitKey(1) & 0xFF
        if key == 27:       # ESC
            break
        elif key == 32:     # SPACE — force immediate analysis
            with state_lock:
                state["force_analyze"] = True
            print("[SPACE] Forcing immediate analysis...")

    cap.release()
    cv2.destroyAllWindows()
    print("👋 Exited.")


if __name__ == "__main__":
    main()




