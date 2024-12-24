import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./router/NotFound";
import Home from "./router/Home";
import Login from "./router/Login";
import Register from "./router/Register";
import Profile from "./router/PtPages/Profile";
import PatientHome from "./router/PtPages/PatientHome";
import ContactDr from "./router/PtPages/ContactDr";
import Symptoms from "./router/PtPages/Symptoms";
import RiskFactors from "./router/PtPages/RiskFactors";
import DietPlans from "./router/PtPages/DietPlans";
import ExercisePlans from "./router/PtPages/ExercisePlans";
import PatientCalender from "./router/PtPages/PatientCalender";
import PatientHelp from "./router/PtPages/PatientHelp";
import React from "react";
import DrHomePage from "./router/DrPages/DrHomePage";
import FindPatient from "./router/DrPages/FindPatient";
import ViewCalendar from "./router/DrPages/ViewCalendar";
import DrProfile from "./router/DrPages/DrProfile";
import DrRegister from "./router/DrPages/DrRegister";
import ProtectedRoute from "./utils/ProtectedRoute";
import DrDetailedPatient from "./router/DrPages/DrDetailedPatient";
import ProjectIntro from "./router/ProjectIntro";
import NuDetailedPatient from "./router/NuPages/NuDetailedPatient";
import NuFindPatient from "./router/NuPages/NuFindPatient";
import NuRegister from "./router/NuPages/NuRegister";
import NuHomePage from "./router/NuPages/NuHome";
import Message from "./router/Message";
import DrProfilep from "./router/PtPages/DrProfile";
import Feedback from "./router/Feedback";
import RiskFactorQuestions from "./router/PtPages/RiskFactorQuestions";
import NuProfile from "./router/NuPages/NuProfile";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<Home />} />
                <Route path={"/login"} element={<Login />} />
                <Route path="/dr-profile" element={<DrProfilep />} />
                <Route path={"/register"} element={<Register />} />
                <Route path={"/projects"} element={<ProjectIntro />} />
                <Route path={"/dr_register"} element={<DrRegister />} />
                <Route path={"/profile"} element={<ProtectedRoute element={<Profile />} />} />
                <Route path={"/drprofile"} element={<ProtectedRoute element={<DrProfile />} />} />
                <Route path={"/drhome"} element={<ProtectedRoute element={<DrHomePage />} />} />
                <Route path="/patient-home" element={<ProtectedRoute element={<PatientHome />} />} />
                <Route path="/contact-dr" element={<ProtectedRoute element={<ContactDr />} />} />
                <Route path="/detailed-pt" element={<ProtectedRoute element={<DrDetailedPatient />} />} />
                <Route path="/symptoms" element={<Symptoms />} />
                <Route path="/risk-factors" element={<RiskFactors />} />
                <Route path="/risk-factors-question" element={<RiskFactorQuestions />} />
                <Route path="/diet-plans" element={<DietPlans />} />
                <Route path="/exercise-plans" element={<ExercisePlans />} />
                <Route path="/patient-calendar" element={<PatientCalender />} />
                <Route path={'*'} element={<NotFound />} />
                <Route path={'/404'} element={<NotFound />} />
                <Route path="/findpatient" element={<ProtectedRoute element={<FindPatient />} />} />
                <Route path="/calendar" element={<ProtectedRoute element={<ViewCalendar />} />} />
                <Route path="/nutritionist-pt" element={<ProtectedRoute element={<NuDetailedPatient />} />} />
                <Route path="/nutritionist-findpatient" element={<ProtectedRoute element={<NuFindPatient />} />} />
                <Route path="/nutritionist-register" element={<NuRegister />} />
                <Route path="/nutritionist-home" element={<ProtectedRoute element={<NuHomePage />} />} />
                <Route path={"/nuprofile"} element={<ProtectedRoute element={<NuProfile />} />} />
                <Route path="/message" element={<ProtectedRoute element={<Message />} />} />
                <Route path={'/feedback'} element={<Feedback />} />
                <Route path="/help" element={<PatientHelp />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
