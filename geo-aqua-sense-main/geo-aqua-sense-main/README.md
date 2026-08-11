# GeoAquaSense — AI-Driven Groundwater Heavy Metal Pollution Intelligence

GeoAquaSense is an interactive GeoAI-based platform for analyzing, visualizing, and assessing heavy-metal contamination in groundwater.

The system combines groundwater quality data, Heavy Metal Pollution Index (HPI), spatial analysis, geospatial visualization, machine learning models, and AI-assisted scientific insights to help identify pollution hotspots, assess health risks, and support data-driven water-quality decisions.

---

## Overview

Groundwater contamination by heavy metals such as Arsenic (As), Lead (Pb), Cadmium (Cd), Chromium (Cr), and Nickel (Ni) can pose serious environmental and public-health risks.

Traditional groundwater assessment often relies on isolated sampling points and static analysis. GeoAquaSense provides an interactive platform that integrates:

- Heavy Metal Pollution Index (HPI)
- Hazard Index (HI)
- Geospatial groundwater visualization
- Pollution hotspot identification
- Machine learning-based analysis
- Spatial interpolation using Kriging
- Random Forest and XGBoost modeling
- AI-powered scientific interpretation
- Future pollution-risk forecasting
- Next-best sampling recommendations

The goal is to transform raw groundwater measurements into actionable environmental intelligence.

---

## Key Features

### 1. Groundwater Quality Analysis

Analyze groundwater samples using important heavy-metal parameters:

- Arsenic (As)
- Lead (Pb)
- Cadmium (Cd)
- Chromium (Cr)
- Nickel (Ni)

The platform processes groundwater measurements and presents pollution indicators through interactive dashboards.

### 2. Heavy Metal Pollution Index (HPI)

The system calculates and visualizes HPI-based pollution levels to provide an overall assessment of groundwater quality.

HPI values are used to identify locations requiring further investigation and monitoring.

### 3. Hazard Index (HI)

The platform incorporates Hazard Index analysis to provide an indication of potential health risk associated with heavy-metal exposure.

### 4. Interactive Geospatial Visualization

Groundwater samples can be explored geographically using interactive maps.

The platform supports:

- Sample location visualization
- Pollution hotspot identification
- Coordinate-based analysis
- Spatial patterns
- Deeper geospatial analytics

Leaflet and React-Leaflet are used for interactive map visualization.

### 5. GeoAI / Machine Learning Analysis

The platform provides an ML analysis layer combining multiple approaches:

- Kriging spatial interpolation
- Random Forest
- XGBoost
- Ensemble-based analysis

The system uses these approaches to study contamination patterns and generate predictive insights.

### 6. SHAP-Style Explainability

The ML dashboard provides feature-contribution visualization to help understand which parameters contribute most strongly to predicted pollution risk.

Example factors include:

- Arsenic concentration
- Cadmium concentration
- Lead concentration
- Groundwater depth
- pH

### 7. Pollution Risk Forecasting

The platform provides future-risk visualization using projected HPI trends.

Users can inspect potential changes over future time periods and identify areas requiring additional monitoring.

### 8. AI-Powered Scientific Insights

GeoAquaSense integrates an LLM-based analysis layer to convert groundwater statistics into readable scientific insights.

The AI analysis can provide:

- Potential contamination sources
- Risk classification
- Remediation strategies
- Key findings
- Pollution trends
- Hotspot analysis
- Health-burden interpretation
- Smart recommendations

### 9. Next-Best Sampling Recommendation

The system provides a recommended next sampling location based on spatial uncertainty and pollution patterns.

This can help prioritize field sampling resources toward areas that may provide additional information about groundwater contamination.

### 10. Model Comparison

The dashboard provides comparative visualization of different predictive approaches, including:

- Kriging
- Random Forest
- XGBoost
- Proposed Ensemble approach

This allows users to visually compare model performance.

---

## System Architecture

```text
                    ┌─────────────────────────┐
                    │     Groundwater Data    │
                    │  Heavy Metal Samples    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Data Processing     │
                    │  Cleaning & Preparation │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
          ┌──────────┐    ┌────────────┐   ┌────────────┐
          │   HPI    │    │     HI     │   │  Spatial   │
          │ Analysis │    │  Analysis  │   │  Analysis  │
          └────┬─────┘    └─────┬──────┘   └─────┬──────┘
               │                │                │
               └────────────────┼────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │      GeoAI / ML Layer   │
                    │                         │
                    │ Kriging │ RF │ XGBoost │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   AI Scientific Layer   │
                    │   LLM-based Insights    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Interactive Web Dashboard│
                    │                         │
                    │ Maps │ Charts │ Risk    │
                    │ Forecasts │ Insights    │
                    └─────────────────────────┘
