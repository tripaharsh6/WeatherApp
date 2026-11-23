# Personalized Weather Mobile Application — Development Progress

**Project:** Development of Personalized Home Page for Weather Mobile Application  
**Student:** Harsh Mani Tripathi (Reg. 12306951)  
**Course:** INT253 — Web Development in Python using Django  
**Status as of Pause:** Safely Paused (All work saved and preserved)  

---

## 1. Project Overview & Architecture
* **Frontend:** React Native with Expo SDK 58, React Navigation 7 (Native Stack + Bottom Tabs), Axios with JWT Interceptors, `expo-secure-store`, Custom Theme Provider (Light/Dark matching mockups).
* **Backend:** Django 6.1 + Django REST Framework 3.18, `djangorestframework-simplejwt` 5.5 (access & refresh tokens), `django-cors-headers` 4.9, `requests`, in-memory/DB caching engine (10 min TTL).
* **Database:** PostgreSQL 18 driver (`psycopg 3.3.9` & `psycopg-binary 3.3.9`) configured with seamless local development fallback (`db.sqlite3`).
* **Original Assets Preserved:**
  * `DjangoReport.pdf` (SRS Document, 19 pages)
  * `Home, City detail, Settings@1x.png` (Screens 1, 2, 3 mockups)
  * `Login and Register@1x.png` (Screens 4, 5 mockups)

---

## 2. Completed Tasks

### Phase 1: Environment & Database Setup
- [x] Verified system environment: Python 3.14.7, Node.js v22.21.0, npm 10.9.4.
- [x] Installed Django, DRF, SimpleJWT, django-cors-headers, python-dotenv, requests, and official PostgreSQL driver `psycopg` (3.3.9).
- [x] Scaffolding of backend Django project (`weather_project`) and apps: `accounts` and `weather`.
- [x] Configured `backend/.env` and `backend/.env.example`.
- [x] Configured Django `settings.py` for CORS (`10.0.2.2`, LAN, localhost), SimpleJWT token lifetimes, caching layer (600s TTL), and dual PostgreSQL/SQLite database support.

### Phase 2: Backend Auth & Accounts Module
- [x] Built `UserProfile` model (`user`, `units`, `theme`, `default_city`).
- [x] Built `FavoriteCity` model with unique constraint on `(user, name)`.
- [x] Implemented post-save Django signals to auto-create and save `UserProfile`.
- [x] Built `UserRegisterSerializer`, `UserLoginSerializer`, `UserProfileSerializer`, and `FavoriteCitySerializer`.
- [x] Implemented API endpoints:
  * `POST /api/register/` (Registration with automatic profile & token generation)
  * `POST /api/login/` (JWT token issuance)
  * `POST /api/token/refresh/` (JWT token rotation)
  * `GET, PUT /api/profile/` (Manage user preferences: units, theme, default city)
  * `GET, POST /api/cities/` (Favorite cities list & add)
  * `DELETE /api/cities/{id}/` (Remove favorite city)

### Phase 3: Weather Service, Caching & Suggestion Engine
- [x] Implemented `weather/services.py`:
  * Weather code mapping for WMO codes.
  * Rule-based "Today's tip" engine matching exact mockup advice:
    * *"Rain expected. Take an umbrella."*
    * *"It is hot and dry. Carry water with you."*
  * Caching engine using Django Cache Framework (10-minute cache key by coords/city and units).
  * Geocoding service (`geocode_city`) via Open-Meteo Geocoding API with 1-hour cache.
  * Support for `WEATHER_API_KEY` (OpenWeatherMap / WeatherAPI) with zero-config live fallback.
- [x] Implemented weather API endpoints:
  * `GET /api/weather/` (Current weather for default or specified city/coordinates)
  * `GET /api/weather/favorites/` (Summary of all user's favorite cities with live temperature & conditions)
  * `GET /api/forecast/` (Hourly strip, 5-day daily forecast, sunrise, sunset, humidity, wind)
  * `GET /api/search/?q=` (Real-time city search)

### Phase 4: Backend Migrations & Automated Tests
- [x] Created database migrations: `accounts.0001_initial`.
- [x] Successfully applied all migrations to database.
- [x] Created 13 unit tests in `accounts/tests.py` and `weather/tests.py` covering:
  * Registration (valid & duplicate checks)
  * Login (valid & invalid passwords)
  * Unauthenticated 401 access rejection
  * Profile updates (Celsius to Fahrenheit, Light to Dark)
  * Favorite cities addition, duplicate rejection, and deletion
  * Weather tip logic for rain, heat, and cold
  * Weather and forecast endpoints
  * Caching verification on repeated requests
- [x] **Ran `manage.py test`: 13/13 tests passed (Ran 13 tests in 17.8s, OK).**

### Phase 5 & 6: React Native Expo Frontend Implementation
- [x] Initialized Expo project in `frontend/` using Expo SDK 58.
- [x] Installed all dependencies: React Navigation 7 (Native Stack, Bottom Tabs), `react-native-screens`, `react-native-safe-area-context`, `axios`, `expo-secure-store`, `@expo/vector-icons`.
- [x] Built Design System & Colors (`frontend/src/theme/colors.js`):
  * Light theme palette matching Screen 1, 2, 4, 5.
  * Dark theme palette matching Screen 3 (Settings dark theme).
- [x] Built Secure Storage (`frontend/src/utils/storage.js`) with SecureStore & web fallback.
- [x] Built Axios API Client (`frontend/src/api/client.js`):
  * Configured Android emulator loopback (`http://10.0.2.2:8000/api`).
  * Automatic `Authorization: Bearer <token>` injection.
  * Seamless token refresh interceptor using `/api/token/refresh/`.
- [x] Built Global Context Providers:
  * `ThemeContext.js` (Light/Dark state with persistent storage and profile sync).
  * `AuthContext.js` (User session, login, register, token persistence, logout).
- [x] Built UI Components matching mockups:
  * `SunBadge.js` (Centered circular blue badge with sun icon).
  * `CustomInput.js` (Labeled input with helper/error text).
  * `CustomButton.js` (Primary, secondary, and dashed styles).
  * `HeroWeatherCard.js` (Vibrant blue card with temperature, condition, humidity/wind pills).
  * `HourlyForecastStrip.js` (Horizontal scrollable strip with timestamps & temperatures).
  * `TodaysTipCard.js` (Sage-green banner with bold "Today's tip" and contextual advice).
  * `FavoriteCityCard.js` (City cards with condition, temperature, and remove button).
  * `FiveDayForecast.js` (5-day daily forecast table with high/low ranges).
  * `MetricsGrid.js` (2x2 grid for Humidity, Wind, Sunrise, Sunset).
- [x] Built All Application Screens:
  * `LoginScreen.js` (Matching Screenshot 4).
  * `RegisterScreen.js` (Matching Screenshot 5).
  * `HomeScreen.js` (Matching Screenshot 1).
  * `CityDetailScreen.js` (Matching Screenshot 2).
  * `SettingsScreen.js` (Matching Screenshot 3).
  * `SearchScreen.js` (City search & add to favorites/set default).
- [x] Built Complete Navigation Flow:
  * `AuthNavigator.js` (Login, Register).
  * `AppNavigator.js` (Bottom tabs: Home, Search, Settings).
  * `MainStack.js` (App tabs + CityDetail screen).
  * `RootNavigator.js` (Auth guard & splash screen).
  * `App.js` (Integrated SafeArea, Theme, Auth providers).

---

## 3. Current Implementation Status & File Manifest

### Backend Files:
* `backend/.env` & `backend/.env.example`
* `backend/manage.py`
* `backend/weather_project/settings.py`
* `backend/weather_project/urls.py`
* `backend/weather_project/wsgi.py`
* `backend/accounts/models.py`
* `backend/accounts/signals.py`
* `backend/accounts/apps.py`
* `backend/accounts/serializers.py`
* `backend/accounts/views.py`
* `backend/accounts/urls.py`
* `backend/accounts/tests.py`
* `backend/accounts/migrations/0001_initial.py`
* `backend/weather/services.py`
* `backend/weather/views.py`
* `backend/weather/urls.py`
* `backend/weather/tests.py`
* `backend/db.sqlite3`

### Frontend Files:
* `frontend/package.json` & `frontend/package-lock.json`
* `frontend/app.json`
* `frontend/App.js`
* `frontend/src/theme/colors.js`
* `frontend/src/utils/storage.js`
* `frontend/src/api/client.js`
* `frontend/src/context/ThemeContext.js`
* `frontend/src/context/AuthContext.js`
* `frontend/src/components/common/SunBadge.js`
* `frontend/src/components/common/CustomInput.js`
* `frontend/src/components/common/CustomButton.js`
* `frontend/src/components/weather/TodaysTipCard.js`
* `frontend/src/components/weather/HeroWeatherCard.js`
* `frontend/src/components/weather/HourlyForecastStrip.js`
* `frontend/src/components/weather/FavoriteCityCard.js`
* `frontend/src/components/weather/FiveDayForecast.js`
* `frontend/src/components/weather/MetricsGrid.js`
* `frontend/src/screens/auth/LoginScreen.js`
* `frontend/src/screens/auth/RegisterScreen.js`
* `frontend/src/screens/main/HomeScreen.js`
* `frontend/src/screens/main/CityDetailScreen.js`
* `frontend/src/screens/main/SearchScreen.js`
* `frontend/src/screens/main/SettingsScreen.js`
* `frontend/src/navigation/AuthNavigator.js`
* `frontend/src/navigation/AppNavigator.js`
* `frontend/src/navigation/MainStack.js`
* `frontend/src/navigation/RootNavigator.js`

---

## 4. Pending Tasks

- [ ] **Data Seeding**: Populate the test user (`rahul_sharma`, password `password123` with favorite cities `Mumbai`, `Chandigarh`, and default city `Delhi` matching the mockup screens).
- [ ] **Android Runtime Execution**: Start Django backend (`python manage.py runserver 0.0.0.0:8000`) and Expo frontend (`npx expo start --android`).
- [ ] **Emulator / Physical Device Verification**: Test full user flow (Login -> Home personalized -> City Detail -> Search -> Settings dark theme toggle -> Logout).
- [ ] **APK Build**: Generate the standalone Android APK using EAS Build / Gradle build process.

---

## 5. Errors or Unresolved Issues
* **None blocking.**
* Note on Expo CLI Telemetry: When running Expo CLI commands in a sandboxed terminal, setting `EXPO_NO_TELEMETRY=1` or running unsandboxed avoids Windows user-directory permission errors (`mkdir C:\Users\prabh\.expo`).

---

## 6. Exact Next Step When You Return
When you return and say **"Resume"** or **"Continue"**, I will:
1. Seed the initial user account (`rahul_sharma` / `password123` with Mumbai & Chandigarh favorites).
2. Start the Django backend service on `0.0.0.0:8000`.
3. Launch the Expo Android client and verify live communication via `10.0.2.2`.
4. Proceed directly with the APK build generation.
