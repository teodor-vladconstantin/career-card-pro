# JobSwipe - Tinder for Jobs

Un MVP complet funcțional tip Tinder pentru joburi, construit cu React, Vite, Tailwind CSS și Supabase.

## 🎯 Features

### Pentru Talente (Candidați)
- ✅ Cont și profil complet: CV upload, LinkedIn, GitHub, portofoliu, bio, skills, experiență, educație, locație
- ✅ Feed de joburi personalizat cu matching inteligent (skills, experiență, locație, preferințe)
- ✅ Swipe carduri tip Tinder: dreapta = aplică, stânga = ignoră
- ✅ Feed nelimitat cu joburi noi
- ✅ Editare profil oricând (compania vede versiunea actualizată)
- ✅ Confidențialitate totală: profil vizibil doar la joburile unde aplici
- ✅ Notificări în timp real pentru aplicații
- ✅ Filtre avansate: tip job (remote/onsite/hybrid), domeniu, experiență, locație, skills

### Pentru Companii (Angajatori)
- ✅ Cont companie cu profil complet
- ✅ Postare, editare și ștergere joburi
- ✅ Vizualizare talente care au aplicat la joburile proprii
- ✅ Management status aplicații: `pending`, `in_review`, `accepted`, `rejected`
- ✅ Notificări în timp real când un talent aplică
- ✅ Acces la profiluri complete ale candidaților

### Pentru Admin (God Mode)
- ✅ Dashboard complet cu statistici
- ✅ Vizualizare și management: toate conturile, joburile, aplicațiile
- ✅ Acces complet la toate datele
- ✅ Forțare vizibilitate talente la orice companie/job

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase
  - Authentication
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Storage
- **State Management**: TanStack Query
- **Routing**: React Router v6

## 📦 Database Schema

### Tables
1. **profiles** - Profiluri talente
2. **companies** - Profiluri companii
3. **user_roles** - Roluri utilizatori (separate pentru securitate)
4. **jobs** - Postări de joburi
5. **swipes** - Aplicații (swipe dreapta/stânga)
6. **notifications** - Notificări în timp real

### Enums
- `user_role`: `talent`, `company`, `admin`
- `application_status`: `pending`, `in_review`, `accepted`, `rejected`
- `swipe_direction`: `left`, `right`
- `job_type`: `remote`, `onsite`, `hybrid`
- `notification_type`: `application_received`, `application_status_changed`, `new_job_match`, `system`

## 🎨 Design System

Design modern inspirat din Tinder cu gradient vibrant (purple-blue) și accente coral/orange:

- **Primary**: Purple gradient (#9333EA)
- **Secondary**: Blue (#3B82F6)
- **Accent**: Orange/Coral (#FB923C)
- **Success**: Green (#10B981)
- **Animations**: Smooth transitions, spring animations, fade-in effects

## 🔒 Security

- ✅ Row Level Security (RLS) policies pe toate tabelele
- ✅ Roluri separate în tabel dedicat (previne privilege escalation)
- ✅ Confidențialitate: talentele vizibile doar companiilor unde aplică
- ✅ Admins au acces complet (God Mode)
- ✅ Security definer functions pentru verificări de rol

## 📱 Pages & Routes

```
/ - Landing page
/login - Login pentru toate rolurile
/signup - Signup cu tab pentru talent/company
/talent/dashboard - Feed cu swipe cards
/talent/profile - Editare profil complet
/talent/notifications - Notificări
/company/dashboard - Management joburi + aplicații
/company/notifications - Notificări
/admin/dashboard - God Mode dashboard
/admin/notifications - Notificări admin
```

## 🎯 Flow-uri Principale

### Talent Flow
1. Signup/Login → Dashboard cu feed de joburi
2. Swipe dreapta = Aplică instant, stânga = Skip
3. Filtrare joburi după preferințe
4. Editare profil oricând
5. Tracking aplicații în timp real

### Company Flow
1. Signup/Login → Dashboard
2. Postare joburi cu detalii complete
3. Vizualizare aplicații primite
4. Update status aplicații
5. Notificări la fiecare aplicație nouă

### Admin Flow
1. Login → God Mode Dashboard
2. Overview complet: stats, talente, companii, joburi, aplicații
3. Management complet al tuturor entităților
4. Acces nelimitat la toate datele

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔑 Environment Variables

Variabilele Supabase sunt deja configurate în `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## 📝 Features Implementate

✅ **Authentication** - Signup/Login pentru toate rolurile  
✅ **Swipe System** - Animații fluide tip Tinder cu Framer Motion  
✅ **Smart Matching** - Filtrare și matching inteligent  
✅ **Realtime Notifications** - Subscriptions Supabase  
✅ **Privacy** - RLS policies stricte  
✅ **Admin God Mode** - Acces complet la toate datele  
✅ **Responsive Design** - Mobile-first approach  
✅ **Modern UI** - shadcn/ui components cu design system custom  

## 🎨 Components

- **SwipeContainer** - Container pentru carduri cu drag & drop
- **JobCard** - Card job cu animații și detalii
- **Header** - Navigation cu notificări
- **Filters** - Filtrare avansată joburi

## 📊 Database Triggers & Functions

- `handle_new_user()` - Creează profil automat la signup
- `update_updated_at_column()` - Update timestamp automat
- `has_role()` - Security definer pentru verificări de rol

## 🔔 Realtime Features

- Notificări instant când talent aplică
- Update status aplicații în timp real
- Sincronizare profil talent actualizat pentru companii

## 🎯 MVP Complete

Toate cerințele din PRD sunt implementate:
- ✅ 3 Roluri complete (Talent, Company, Admin)
- ✅ Swipe system tip Tinder
- ✅ Matching inteligent cu filtre
- ✅ Confidențialitate totală
- ✅ Notificări realtime
- ✅ Admin God Mode
- ✅ Design modern și responsive
- ✅ Backend complet cu Supabase

---

**Built with ❤️ using React + Supabase**
