-- Create enum types
CREATE TYPE user_role AS ENUM ('talent', 'company', 'admin');
CREATE TYPE application_status AS ENUM ('pending', 'in_review', 'accepted', 'rejected');
CREATE TYPE swipe_direction AS ENUM ('left', 'right');
CREATE TYPE job_type AS ENUM ('remote', 'onsite', 'hybrid');
CREATE TYPE notification_type AS ENUM ('application_received', 'application_status_changed', 'new_job_match', 'system');

-- Profiles table for talents
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  education TEXT,
  location TEXT,
  cv_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  location TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table (separate for security)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills_required TEXT[] DEFAULT '{}',
  experience_required INTEGER DEFAULT 0,
  location TEXT,
  job_type job_type DEFAULT 'onsite',
  salary_range TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Swipes/Applications table
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  direction swipe_direction NOT NULL,
  application_status application_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(talent_id, job_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  related_talent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Talents can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Talents can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Talents can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Companies can view profiles of applicants"
  ON profiles FOR SELECT
  USING (
    has_role(auth.uid(), 'company') AND
    EXISTS (
      SELECT 1 FROM swipes s
      JOIN jobs j ON s.job_id = j.id
      WHERE s.talent_id = profiles.id
        AND j.company_id = auth.uid()
        AND s.direction = 'right'
    )
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for companies
CREATE POLICY "Companies can manage their own data"
  ON companies FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Everyone can view companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all companies"
  ON companies FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for jobs
CREATE POLICY "Talents can view active jobs"
  ON jobs FOR SELECT
  USING (is_active = true AND has_role(auth.uid(), 'talent'));

CREATE POLICY "Companies can manage their own jobs"
  ON jobs FOR ALL
  USING (auth.uid() = company_id);

CREATE POLICY "Admins can manage all jobs"
  ON jobs FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for swipes
CREATE POLICY "Talents can view their own swipes"
  ON swipes FOR SELECT
  USING (auth.uid() = talent_id);

CREATE POLICY "Talents can create swipes"
  ON swipes FOR INSERT
  WITH CHECK (auth.uid() = talent_id);

CREATE POLICY "Companies can view swipes for their jobs"
  ON swipes FOR SELECT
  USING (
    has_role(auth.uid(), 'company') AND
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = swipes.job_id
        AND jobs.company_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update swipe status for their jobs"
  ON swipes FOR UPDATE
  USING (
    has_role(auth.uid(), 'company') AND
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = swipes.job_id
        AND jobs.company_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all swipes"
  ON swipes FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications"
  ON notifications FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swipes_updated_at
  BEFORE UPDATE ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_type user_role;
BEGIN
  -- Get role from metadata
  user_role_type := (NEW.raw_user_meta_data->>'role')::user_role;
  
  -- Insert user role
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, user_role_type);
  
  -- Create profile based on role
  IF user_role_type = 'talent' THEN
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'));
  ELSIF user_role_type = 'company' THEN
    INSERT INTO companies (id, company_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'New Company'));
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;